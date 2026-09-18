import { useEffect, useMemo, useState } from "react";
import {
  Badge,
  Box,
  Button,
  Flex,
  Heading,
  HStack,
  Input,
  Text,
  Textarea,
} from "@chakra-ui/react";
import { Search, X, Calculator, PackageCheck } from "lucide-react";
import { API_URL } from "../config/api";

interface ItemNota {
  id: string;
  codigo?: string | null;
  descricao?: string | null;
  pesoLiquido?: number | null;
  quantidade?: number | null;
  valorUnitario?: number | null;
  valorTotal?: number | null;
}

interface Nota {
  id: string;
  numeroNf: string;
  numeroNfOriginal?: string | null;
  cliente?: string | null;
  codigoCliente?: string | null;
  vendedor?: string | null;
  valor?: number | null;
  peso?: number | null;
  pesoLiquido?: number | null;
  unidade?: string | null;
  itens: ItemNota[];
}

interface ItemDevolucao extends ItemNota {
  pesoDevolvido: number;
}

const COLORS = {
  bg: "#0F1115",
  card: "#111318",
  cardHover: "#171A21",
  border: "#252932",
  borderHover: "#353B47",
  text: "#F1F5F9",
  secondary: "#94A3B8",
  muted: "#64748B",
  blue: "#3B82F6",
  blueHover: "#2563EB",
  blueSoft: "rgba(59,130,246,.12)",
  danger: "#F87171",
};

function money(value: number) {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function numberBR(value: number) {
  return value.toLocaleString("pt-BR", { maximumFractionDigits: 3 });
}

export function Buscar() {
  const [termo, setTermo] = useState("");
  const [notas, setNotas] = useState<Nota[]>([]);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");
  const [nota, setNota] = useState<Nota | null>(null);
  const [itens, setItens] = useState<ItemDevolucao[]>([]);
  const [tipoDevolucao, setTipoDevolucao] = useState<"total" | "parcial">(
    "parcial",
  );
  const [observacao, setObservacao] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [sucesso, setSucesso] = useState("");

  useEffect(() => {
    fetch(`${API_URL}/api/notas`)
      .then((res) => res.json())
      .then((data) => setNotas(Array.isArray(data.notas) ? data.notas : []))
      .catch(() => setErro("Não foi possível carregar as notas fiscais."));
  }, []);

  const abrirNota = async () => {
    const nf = termo.trim();
    if (!nf) return;

    setErro("");
    setSucesso("");
    setLoading(true);

    try {
      const response = await fetch(
        `${API_URL}/api/notas/${encodeURIComponent(nf)}`,
      );
      const data = await response.json();

      if (!response.ok || !data.nota) {
        setErro(data.error || "Nota Fiscal não encontrada.");
        setNota(null);
        return;
      }

      const encontrada: Nota = data.nota;
      setNota(encontrada);
      setTipoDevolucao("parcial");
      setObservacao("");
      setItens(
        (encontrada.itens || []).map((item) => ({
          ...item,
          pesoDevolvido: 0,
        })),
      );
    } catch {
      setErro("Falha ao consultar a Nota Fiscal.");
    } finally {
      setLoading(false);
    }
  };

  const fecharModal = () => {
    if (salvando) return;
    setNota(null);
    setItens([]);
    setObservacao("");
    setErro("");
  };

  const alterarPeso = (index: number, value: string) => {
    const numeric = Number(value.replace(",", "."));
    const max = Number(itens[index].pesoLiquido || 0);
    const peso = Number.isFinite(numeric)
      ? Math.max(0, Math.min(numeric, max))
      : 0;

    setItens((current) =>
      current.map((item, i) =>
        i === index ? { ...item, pesoDevolvido: peso } : item,
      ),
    );
  };

  const selecionarTipo = (value: "total" | "parcial") => {
    setTipoDevolucao(value);
    if (value === "total") {
      setItens((current) =>
        current.map((item) => ({
          ...item,
          pesoDevolvido: Number(item.pesoLiquido || 0),
        })),
      );
    } else {
      setItens((current) =>
        current.map((item) => ({ ...item, pesoDevolvido: 0 })),
      );
    }
  };

  const itensCalculados = useMemo(
    () =>
      itens.map((item) => ({
        ...item,
        valorDevolucao:
          Number(item.pesoDevolvido || 0) * Number(item.valorUnitario || 0),
      })),
    [itens],
  );

  const totalPesoDevolvido = itensCalculados.reduce(
    (sum, item) => sum + item.pesoDevolvido,
    0,
  );
  const totalValorDevolucao = itensCalculados.reduce(
    (sum, item) => sum + item.valorDevolucao,
    0,
  );

  const registrarDevolucao = async () => {
    if (!nota) return;

    if (tipoDevolucao === "parcial" && totalPesoDevolvido <= 0) {
      setErro("Informe o peso devolvido de pelo menos um item.");
      return;
    }

    if (!observacao.trim()) {
      setErro("Informe a observação/motivo da devolução.");
      return;
    }

    setSalvando(true);
    setErro("");

    try {
      const userRaw = localStorage.getItem("user");
      const user = userRaw ? JSON.parse(userRaw) : null;

      const response = await fetch(`${API_URL}/api/ocorrencias`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(localStorage.getItem("token")
            ? { Authorization: `Bearer ${localStorage.getItem("token")}` }
            : {}),
        },
        body: JSON.stringify({
          numeroNf: nota.numeroNf,
          motivo:
            tipoDevolucao === "total" ? "Devolução total" : "Devolução parcial",
          observacao: observacao.trim(),
          unidade: nota.unidade || "kg",
          itens: itensCalculados
            .filter((item) => item.pesoDevolvido > 0)
            .map((item) => ({
              id: item.id,
              codigo: item.codigo,
              descricao: item.descricao,
              pesoOriginal: Number(item.pesoLiquido || 0),
              pesoDevolvido: item.pesoDevolvido,
              valorUnitario: Number(item.valorUnitario || 0),
              valorDevolucao: item.valorDevolucao,
            })),
          totalQtd: itensCalculados.filter((item) => item.pesoDevolvido > 0)
            .length,
          totalPeso: totalPesoDevolvido,
          totalValor: totalValorDevolucao,
          valorNota: Number(nota.valor || 0),
          pesoNota: Number(nota.peso || nota.pesoLiquido || 0),
          criadoPor: user
            ? { nome: user.name, email: user.email }
            : { nome: "Sistema", email: "admin@sistema.com" },
          criadoPorEmail: user?.email || "admin@sistema.com",
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        setErro(data.error || "Não foi possível registrar a devolução.");
        return;
      }

      setSucesso("Devolução registrada com sucesso!");
      setTimeout(() => {
        fecharModal();
        setSucesso("");
      }, 900);
    } catch {
      setErro("Falha ao conectar com o servidor.");
    } finally {
      setSalvando(false);
    }
  };

  return (
    <Box
      p={{ base: "20px", lg: "32px" }}
      maxW="1400px"
      mx="auto"
      color={COLORS.text}
    >
      <Box mb="28px">
        <Heading fontSize="24px" fontWeight="600">
          Buscar Nota Fiscal
        </Heading>
        <Text color={COLORS.secondary} fontSize="14px" mt="4px">
          Consulte uma NF e registre uma devolução com os pesos e valores dos
          itens.
        </Text>
      </Box>

      <Box
        bg={COLORS.card}
        border="1px solid"
        borderColor={COLORS.border}
        borderRadius="14px"
        p={{ base: "20px", lg: "28px" }}
      >
        <Text
          fontSize="12px"
          fontWeight="700"
          color={COLORS.secondary}
          letterSpacing=".08em"
          mb="8px"
        >
          NÚMERO DA NOTA FISCAL
        </Text>
        <HStack gap="10px" maxW="620px">
          <Input
            value={termo}
            onChange={(e) => setTermo(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && abrirNota()}
            placeholder="Digite o número da NF"
            bg={COLORS.bg}
            borderColor={COLORS.borderHover}
            color={COLORS.text}
            _placeholder={{ color: COLORS.muted }}
            _focus={{
              borderColor: COLORS.blue,
              boxShadow: `0 0 0 1px ${COLORS.blue}`,
            }}
          />
          <Button
            bg={COLORS.blue}
            color="white"
            onClick={abrirNota}
            loading={loading}
            px="22px"
            _hover={{ bg: COLORS.blueHover }}
          >
            <Search size={17} /> Pesquisar
          </Button>
        </HStack>
        {erro && !nota && (
          <Text color={COLORS.danger} mt="14px" fontSize="13px">
            {erro}
          </Text>
        )}
      </Box>

      <Box
        mt="28px"
        bg={COLORS.card}
        border="1px solid"
        borderColor={COLORS.border}
        borderRadius="14px"
        p="24px"
      >
        <Text fontWeight="600">Notas recentes</Text>
        <Text color={COLORS.muted} fontSize="13px" mt="4px">
          Use a busca acima para abrir uma nota e iniciar uma devolução.
        </Text>
        {notas.slice(0, 8).map((item) => (
          <Flex
            key={item.id}
            mt="14px"
            p="14px"
            border="1px solid"
            borderColor={COLORS.border}
            borderRadius="10px"
            justify="space-between"
            align="center"
            cursor="pointer"
            _hover={{ bg: COLORS.cardHover, borderColor: COLORS.borderHover }}
            onClick={() => {
              setTermo(item.numeroNf);
              abrirNota();
            }}
          >
            <Box>
              <Text fontWeight="600">NF {item.numeroNf}</Text>
              <Text color={COLORS.secondary} fontSize="13px">
                {item.cliente || "Cliente não informado"}
              </Text>
            </Box>
            <Badge bg={COLORS.blueSoft} color="#60A5FA">
              {item.itens?.length || 0} itens
            </Badge>
          </Flex>
        ))}
      </Box>

      {nota && (
        <Box
          position="fixed"
          inset="0"
          zIndex={1000}
          bg="rgba(0,0,0,.72)"
          display="flex"
          alignItems="center"
          justifyContent="center"
          p="20px"
          onClick={fecharModal}
        >
          <Box
            width="100%"
            maxW="1080px"
            maxH="92vh"
            overflowY="auto"
            bg={COLORS.card}
            border="1px solid"
            borderColor={COLORS.borderHover}
            borderRadius="16px"
            boxShadow="0 24px 80px rgba(0,0,0,.45)"
            onClick={(e) => e.stopPropagation()}
          >
            <Flex
              px="26px"
              py="20px"
              borderBottom="1px solid"
              borderColor={COLORS.border}
              justify="space-between"
              align="center"
              position="sticky"
              top="0"
              bg={COLORS.card}
              zIndex={2}
            >
              <Box>
                <HStack gap="10px">
                  <PackageCheck size={20} color={COLORS.blue} />
                  <Heading fontSize="20px">
                    Nota Fiscal #{nota.numeroNf}
                  </Heading>
                </HStack>
                <Text color={COLORS.secondary} fontSize="13px" mt="5px">
                  Dados da nota e registro de devolução
                </Text>
              </Box>
              <Button variant="ghost" onClick={fecharModal} disabled={salvando}>
                <X />
              </Button>
            </Flex>

            <Box p="26px">
              <Box
                display="grid"
                gridTemplateColumns={{ base: "1fr", md: "1.5fr 1fr 1fr" }}
                gap="14px"
                mb="26px"
              >
                <Box
                  p="16px"
                  bg={COLORS.bg}
                  border="1px solid"
                  borderColor={COLORS.border}
                  borderRadius="10px"
                >
                  <Text fontSize="11px" color={COLORS.muted} fontWeight="700">
                    CLIENTE
                  </Text>
                  <Text fontWeight="600" mt="5px">
                    {nota.cliente || "Não informado"}
                  </Text>
                  <Text fontSize="12px" color={COLORS.secondary} mt="2px">
                    Código: {nota.codigoCliente || "—"}
                  </Text>
                </Box>
                <Box
                  p="16px"
                  bg={COLORS.bg}
                  border="1px solid"
                  borderColor={COLORS.border}
                  borderRadius="10px"
                >
                  <Text fontSize="11px" color={COLORS.muted} fontWeight="700">
                    VENDEDOR
                  </Text>
                  <Text fontWeight="600" mt="5px">
                    {nota.vendedor || "Não informado"}
                  </Text>
                </Box>
                <Box
                  p="16px"
                  bg={COLORS.bg}
                  border="1px solid"
                  borderColor={COLORS.border}
                  borderRadius="10px"
                >
                  <HStack justify="space-between">
                    <Box>
                      <Text
                        fontSize="11px"
                        color={COLORS.muted}
                        fontWeight="700"
                      >
                        VALOR DA NOTA
                      </Text>
                      <Text fontWeight="600" mt="5px">
                        {money(Number(nota.valor || 0))}
                      </Text>
                    </Box>
                    <Box>
                      <Text
                        fontSize="11px"
                        color={COLORS.muted}
                        fontWeight="700"
                      >
                        PESO
                      </Text>
                      <Text fontWeight="600" mt="5px">
                        {numberBR(Number(nota.peso || nota.pesoLiquido || 0))}{" "}
                        kg
                      </Text>
                    </Box>
                  </HStack>
                </Box>
              </Box>

              <Flex align="center" gap="8px" mb="12px">
                <Calculator size={17} color={COLORS.blue} />
                <Text fontWeight="600">Itens da nota</Text>
              </Flex>
              <Box
                border="1px solid"
                borderColor={COLORS.border}
                borderRadius="10px"
                overflow="hidden"
              >
                <Box
                  display="grid"
                  gridTemplateColumns="minmax(240px, 1fr) 110px 130px 160px 150px"
                  gap="12px"
                  px="16px"
                  py="12px"
                  bg="#171A21"
                  color={COLORS.secondary}
                  fontSize="11px"
                  fontWeight="700"
                >
                  <Text>ITEM</Text>
                  <Text>PESO NF</Text>
                  <Text>VALOR/KG</Text>
                  <Text>PESO DEVOLVIDO</Text>
                  <Text>VALOR DEVOLUÇÃO</Text>
                </Box>
                {itensCalculados.map((item, index) => (
                  <Box
                    key={item.id || index}
                    display="grid"
                    gridTemplateColumns="minmax(240px, 1fr) 110px 130px 160px 150px"
                    gap="12px"
                    alignItems="center"
                    px="16px"
                    py="15px"
                    borderTop="1px solid"
                    borderColor={COLORS.border}
                  >
                    <Box>
                      <Text fontSize="13px" fontWeight="600">
                        {item.descricao || "Item sem descrição"}
                      </Text>
                      <Text fontSize="11px" color={COLORS.muted}>
                        Código: {item.codigo || "—"}
                      </Text>
                    </Box>
                    <Text fontSize="13px">
                      {numberBR(Number(item.pesoLiquido || 0))} kg
                    </Text>
                    <Text fontSize="13px">
                      {money(Number(item.valorUnitario || 0))}/kg
                    </Text>
                    <Input
                      type="number"
                      min={0}
                      max={Number(item.pesoLiquido || 0)}
                      step="0.001"
                      value={item.pesoDevolvido || ""}
                      onChange={(e) => alterarPeso(index, e.target.value)}
                      bg={COLORS.bg}
                      borderColor={COLORS.borderHover}
                      color={COLORS.text}
                    />
                    <Text fontWeight="600" color="#60A5FA">
                      {money(item.valorDevolucao)}
                    </Text>
                  </Box>
                ))}
              </Box>

              <Box
                display="grid"
                gridTemplateColumns={{ base: "1fr", md: "1fr 1fr" }}
                gap="16px"
                mt="22px"
              >
                <Box>
                  <Text
                    fontSize="12px"
                    color={COLORS.secondary}
                    fontWeight="700"
                    mb="7px"
                  >
                    TIPO DE DEVOLUÇÃO
                  </Text>
                  <select
                    value={tipoDevolucao}
                    onChange={(e) =>
                      selecionarTipo(e.target.value as "total" | "parcial")
                    }
                    style={{
                      width: "100%",
                      height: "40px",
                      borderRadius: "6px",
                      border: `1px solid ${COLORS.borderHover}`,
                      background: COLORS.bg,
                      color: COLORS.text,
                      padding: "0 12px",
                    }}
                  >
                    <option value="parcial">Devolução parcial</option>
                    <option value="total">Devolução total</option>
                  </select>
                </Box>
                <Box
                  p="14px"
                  bg={COLORS.blueSoft}
                  border="1px solid rgba(59,130,246,.2)"
                  borderRadius="10px"
                >
                  <Flex justify="space-between">
                    <Text color={COLORS.secondary}>Peso devolvido</Text>
                    <Text fontWeight="600">
                      {numberBR(totalPesoDevolvido)} kg
                    </Text>
                  </Flex>
                  <Flex justify="space-between" mt="5px">
                    <Text color={COLORS.secondary}>Valor da devolução</Text>
                    <Text fontWeight="700" color="#60A5FA">
                      {money(totalValorDevolucao)}
                    </Text>
                  </Flex>
                </Box>
              </Box>

              <Box mt="18px">
                <Text
                  fontSize="12px"
                  color={COLORS.secondary}
                  fontWeight="700"
                  mb="7px"
                >
                  OBSERVAÇÃO / MOTIVO DA DEVOLUÇÃO
                </Text>
                <Textarea
                  value={observacao}
                  onChange={(e) => setObservacao(e.target.value)}
                  placeholder="Descreva o motivo da devolução..."
                  minH="100px"
                  bg={COLORS.bg}
                  borderColor={COLORS.borderHover}
                  color={COLORS.text}
                  _placeholder={{ color: COLORS.muted }}
                />
              </Box>

              {erro && (
                <Text color={COLORS.danger} mt="14px" fontSize="13px">
                  {erro}
                </Text>
              )}
              {sucesso && (
                <Text color="#60A5FA" mt="14px" fontSize="13px">
                  {sucesso}
                </Text>
              )}
            </Box>

            <Flex
              px="26px"
              py="18px"
              borderTop="1px solid"
              borderColor={COLORS.border}
              justify="flex-end"
              gap="10px"
              position="sticky"
              bottom="0"
              bg={COLORS.card}
            >
              <Button
                variant="outline"
                borderColor={COLORS.borderHover}
                color={COLORS.text}
                onClick={fecharModal}
                disabled={salvando}
              >
                Cancelar
              </Button>
              <Button
                bg={COLORS.blue}
                color="white"
                onClick={registrarDevolucao}
                loading={salvando}
                _hover={{ bg: COLORS.blueHover }}
              >
                Registrar devolução
              </Button>
            </Flex>
          </Box>
        </Box>
      )}
    </Box>
  );
}
