import { useEffect, useMemo, useState } from "react";

import {
  Calculator,
  Check,
  CircleDollarSign,
  Copy,
  ClipboardCheck,
  FileText,
  PackageCheck,
  Mail,
  Search,
  Weight,
  X,
  type LucideIcon,
} from "lucide-react";

import { toast } from "sonner";

import { API_URL } from "../config/api";
import { gerarEmailOcorrencia } from "../templates/ocorrenciaEmails";

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

/* =========================================================
   TIPOS
========================================================= */

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

interface Ocorrencia {
  id: string;
  numeroNf?: string | null;
  totalPeso?: number | null;
  totalValor?: number | null;
  valorNota?: number | null;
  pesoNota?: number | null;
  dataRef?: string | null;
  createdAt?: string | null;
  motivo?: string | null;
  status?: string | null;
}

type TipoOcorrencia =
  | "local_fechado"
  | "quebra_peso"
  | "parcial"
  | "total"
  | "reentrega";

/* =========================================================
   CORES
========================================================= */

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
  blueSoft: "rgba(59,130,246,.10)",

  orange: "#F59E0B",
  orangeSoft: "rgba(245,158,11,.10)",

  green: "#34D399",
  greenSoft: "rgba(52,211,153,.10)",

  danger: "#F87171",

  purple: "#A78BFA",
  purpleSoft: "rgba(167,139,250,.10)",
};

/* =========================================================
   HELPERS
========================================================= */

function money(value: number) {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function numberBR(value: number) {
  return value.toLocaleString("pt-BR", {
    maximumFractionDigits: 3,
  });
}

function getCurrentUser() {
  try {
    const userRaw = localStorage.getItem("user");

    return userRaw ? JSON.parse(userRaw) : null;
  } catch {
    return null;
  }
}

function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem("token");

  if (!token) {
    return {};
  }

  return {
    Authorization: `Bearer ${token}`,
  };
}

function isCurrentMonth(dateValue?: string | null) {
  if (!dateValue) return false;

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return false;
  }

  const now = new Date();

  return (
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear()
  );
}

const TIPO_OCORRENCIA = {
  local_fechado: {
    label: "Local fechado",
    buttonLabel: "Registrar ocorrência",
  },
  quebra_peso: {
    label: "Quebra de peso",
    buttonLabel: "Registrar quebra de peso",
  },
  parcial: { label: "Devolução parcial", buttonLabel: "Registrar devolução" },
  total: { label: "Devolução total", buttonLabel: "Registrar devolução" },
  reentrega: { label: "Reentrega", buttonLabel: "Registrar reentrega" },
} as const;

function getTipoLabel(tipo: TipoOcorrencia) {
  return TIPO_OCORRENCIA[tipo].label;
}

function getBotaoLabel(tipo: TipoOcorrencia) {
  return TIPO_OCORRENCIA[tipo].buttonLabel;
}

/* =========================================================
   COMPONENTES
========================================================= */

function MetricCard({
  label,
  value,
  icon: Icon,
  accent,
  background,
  loading,
}: {
  label: string;
  value: string;
  icon: LucideIcon;
  accent: string;
  background: string;
  loading?: boolean;
}) {
  return (
    <Box
      bg={COLORS.card}
      border="1px solid"
      borderColor={COLORS.border}
      borderRadius="6px"
      px="18px"
      py="16px"
      minH="108px"
      transition="border-color .15s ease, background .15s ease"
      _hover={{
        borderColor: COLORS.borderHover,
        bg: COLORS.cardHover,
      }}
    >
      <Flex align="flex-start" justify="space-between" gap="12px">
        <Box>
          <Text
            fontSize="11px"
            fontWeight="700"
            letterSpacing=".09em"
            color={COLORS.secondary}
            textTransform="uppercase"
          >
            {label}
          </Text>

          <Text
            mt="10px"
            fontSize={{
              base: "21px",
              lg: "24px",
            }}
            lineHeight="1"
            fontWeight="700"
            color={accent}
            letterSpacing="-0.02em"
          >
            {loading ? "—" : value}
          </Text>
        </Box>

        <Flex
          align="center"
          justify="center"
          w="30px"
          h="30px"
          borderRadius="4px"
          bg={background}
          color={accent}
          flexShrink={0}
        >
          <Icon size={15} strokeWidth={2} />
        </Flex>
      </Flex>
    </Box>
  );
}

function InfoCard({
  label,
  children,
  flex = 1,
}: {
  label: string;
  children: React.ReactNode;
  flex?: number;
}) {
  return (
    <Box
      flex={flex}
      p="12px"
      bg={COLORS.bg}
      border="1px solid"
      borderColor={COLORS.border}
      borderRadius="6px"
      minH="68px"
    >
      <Text
        fontSize="9px"
        color={COLORS.muted}
        fontWeight="700"
        letterSpacing=".06em"
      >
        {label}
      </Text>

      {children}
    </Box>
  );
}

/* =========================================================
   PÁGINA
========================================================= */

export function Buscar() {
  const [termo, setTermo] = useState("");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  const [nota, setNota] = useState<Nota | null>(null);
  const [itens, setItens] = useState<ItemDevolucao[]>([]);

  const [tipoOcorrencia, setTipoOcorrencia] =
    useState<TipoOcorrencia>("parcial");

  const [observacao, setObservacao] = useState("");
  const [salvando, setSalvando] = useState(false);

  const [emailTemplate, setEmailTemplate] = useState("");
  const [emailAssunto, setEmailAssunto] = useState("");
  const [mostrarEmail, setMostrarEmail] = useState(false);
  const [copiandoEmail, setCopiandoEmail] = useState(false);

  const [ocorrencias, setOcorrencias] = useState<Ocorrencia[]>([]);
  const [dashboardLoading, setDashboardLoading] = useState(true);

  const exigePeso =
    tipoOcorrencia === "quebra_peso" ||
    tipoOcorrencia === "parcial" ||
    tipoOcorrencia === "total";

  const isLocalFechado = tipoOcorrencia === "local_fechado";
  const isReentrega = tipoOcorrencia === "reentrega";

  /* =========================================================
     DASHBOARD
  ========================================================= */

  useEffect(() => {
    const carregarDashboard = async () => {
      try {
        setDashboardLoading(true);

        const response = await fetch(`${API_URL}/api/ocorrencias`, {
          headers: {
            ...getAuthHeaders(),
          },
        });

        if (!response.ok) {
          throw new Error();
        }

        const data = await response.json();

        const lista = Array.isArray(data.ocorrencias)
          ? data.ocorrencias
          : Array.isArray(data)
            ? data
            : [];

        setOcorrencias(lista);
      } catch {
        toast.error("Não foi possível carregar os indicadores.");
      } finally {
        setDashboardLoading(false);
      }
    };

    carregarDashboard();
  }, []);

  const ocorrenciasDoMes = useMemo(() => {
    return ocorrencias.filter((ocorrencia) =>
      isCurrentMonth(ocorrencia.dataRef || ocorrencia.createdAt),
    );
  }, [ocorrencias]);

  const totalOcorrencias = ocorrenciasDoMes.length;

  const totalPesoAfetado = useMemo(() => {
    return ocorrenciasDoMes.reduce(
      (total, ocorrencia) => total + Number(ocorrencia.totalPeso || 0),
      0,
    );
  }, [ocorrenciasDoMes]);

  const totalValorAfetado = useMemo(() => {
    return ocorrenciasDoMes.reduce(
      (total, ocorrencia) =>
        total + Number(ocorrencia.totalValor || ocorrencia.valorNota || 0),
      0,
    );
  }, [ocorrenciasDoMes]);

  const totalNfs = useMemo(() => {
    const nfs = new Set(
      ocorrenciasDoMes
        .map((ocorrencia) => ocorrencia.numeroNf?.trim())
        .filter(Boolean),
    );

    return nfs.size;
  }, [ocorrenciasDoMes]);

  /* =========================================================
     BUSCAR NF
  ========================================================= */

  const abrirNota = async () => {
    const nf = termo.trim();

    if (!nf) {
      const mensagem = "Informe o número da Nota Fiscal.";

      setErro(mensagem);
      toast.warning(mensagem);

      return;
    }

    setErro("");
    setLoading(true);

    try {
      const response = await fetch(
        `${API_URL}/api/notas/${encodeURIComponent(nf)}`,
      );

      const data = await response.json();

      if (!response.ok || !data.nota) {
        const mensagem = data.error || "Nota Fiscal não encontrada.";

        setNota(null);
        setErro(mensagem);

        toast.error(mensagem);

        return;
      }

      const encontrada: Nota = data.nota;

      setNota(encontrada);
      setTipoOcorrencia("parcial");
      setObservacao("");
      setErro("");

      setItens(
        (encontrada.itens || []).map((item) => ({
          ...item,
          pesoDevolvido: 0,
        })),
      );
    } catch {
      const mensagem = "Falha ao consultar a Nota Fiscal.";

      setErro(mensagem);
      toast.error(mensagem);
    } finally {
      setLoading(false);
    }
  };

  /* =========================================================
     FECHAR MODAL
  ========================================================= */

  const fecharModal = () => {
    if (salvando) return;

    setNota(null);
    setItens([]);
    setObservacao("");
    setErro("");
    setTipoOcorrencia("parcial");
  };

  /* =========================================================
     PESO
  ========================================================= */

  const alterarPeso = (index: number, value: string) => {
    const numeric = Number(value.replace(",", "."));

    const max = Number(itens[index].pesoLiquido || 0);

    const peso = Number.isFinite(numeric)
      ? Math.max(0, Math.min(numeric, max))
      : 0;

    setItens((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              pesoDevolvido: peso,
            }
          : item,
      ),
    );
  };

  /* =========================================================
     TIPO
  ========================================================= */

  const selecionarTipo = (value: TipoOcorrencia) => {
    setTipoOcorrencia(value);

    if (value === "local_fechado" || value === "reentrega") {
      setItens((current) =>
        current.map((item) => ({
          ...item,
          pesoDevolvido: 0,
        })),
      );

      return;
    }

    if (value === "total") {
      setItens((current) =>
        current.map((item) => ({
          ...item,
          pesoDevolvido: Number(item.pesoLiquido || 0),
        })),
      );

      return;
    }

    setItens((current) =>
      current.map((item) => ({
        ...item,
        pesoDevolvido: 0,
      })),
    );
  };

  /* =========================================================
     CÁLCULOS
  ========================================================= */

  const itensCalculados = useMemo(
    () =>
      itens.map((item) => ({
        ...item,

        valorDevolucao:
          Number(item.pesoDevolvido || 0) * Number(item.valorUnitario || 0),
      })),
    [itens],
  );

  const totalPesoDevolvido = useMemo(() => {
    return itensCalculados.reduce(
      (sum, item) => sum + Number(item.pesoDevolvido || 0),
      0,
    );
  }, [itensCalculados]);

  const totalValorDevolucao = useMemo(() => {
    return itensCalculados.reduce(
      (sum, item) => sum + Number(item.valorDevolucao || 0),
      0,
    );
  }, [itensCalculados]);

  /* =========================================================
     REGISTRAR
  ========================================================= */

  const validarOcorrencia = () => {
    if (!nota) return false;

    if (exigePeso && tipoOcorrencia !== "total" && totalPesoDevolvido <= 0) {
      const mensagem =
        tipoOcorrencia === "quebra_peso"
          ? "Informe o peso faltante de pelo menos um item."
          : "Informe o peso devolvido de pelo menos um item.";

      toast.warning(mensagem);

      return false;
    }

    if (!observacao.trim()) {
      const mensagem =
        tipoOcorrencia === "local_fechado"
          ? "Informe o motivo do local fechado."
          : tipoOcorrencia === "reentrega"
            ? "Informe a observação da reentrega."
            : tipoOcorrencia === "quebra_peso"
              ? "Informe a observação da quebra de peso."
              : "Informe a observação/motivo da devolução.";

      toast.warning(mensagem);

      return false;
    }

    return true;
  };

  const montarDadosOcorrencia = () => {
    if (!nota) return null;

    const user = getCurrentUser();

    const itensDevolvidos =
      isLocalFechado || isReentrega
        ? []
        : itensCalculados
            .filter((item) => item.pesoDevolvido > 0)
            .map((item) => ({
              id: item.id,
              codigo: item.codigo,
              descricao: item.descricao,
              pesoOriginal: Number(item.pesoLiquido || 0),
              pesoDevolvido: item.pesoDevolvido,
              pesoLiquido: item.pesoDevolvido,
              quantidade: item.quantidade,
              valorUnitario: Number(item.valorUnitario || 0),
              valorTotal: item.valorDevolucao,
              valorDevolucao: item.valorDevolucao,
            }));

    const motivoOcorrencia: Record<TipoOcorrencia, string> = {
      local_fechado: "Local fechado",
      quebra_peso: "Quebra de peso",
      parcial: "Devolução parcial",
      total: "Devolução total",
      reentrega: "Reentrega",
    };

    return {
      numeroNf: nota.numeroNf,
      numeroNfOriginal: nota.numeroNfOriginal || nota.numeroNf,
      motivo: motivoOcorrencia[tipoOcorrencia],
      observacao: observacao.trim(),
      unidade: nota.unidade || "kg",
      itens: itensDevolvidos,
      totalQtd: isLocalFechado || isReentrega ? 0 : itensDevolvidos.length,
      totalPeso: isLocalFechado || isReentrega ? 0 : totalPesoDevolvido,
      totalValor: isLocalFechado || isReentrega ? 0 : totalValorDevolucao,
      valorNota: Number(nota.valor || 0),
      pesoNota: Number(nota.peso || nota.pesoLiquido || 0),
      cliente: nota.cliente,
      vendedor: nota.vendedor,
      criadoPor: user
        ? { nome: user.name, email: user.email }
        : { nome: "Sistema", email: "admin@sistema.com" },
      criadoPorEmail: user?.email || "admin@sistema.com",
      createdAt: new Date().toISOString(),
      criadoEm: new Date().toISOString(),
    };
  };

  const gerarOcorrencia = () => {
    if (!validarOcorrencia()) return;

    const ocorrencia = montarDadosOcorrencia();

    if (!ocorrencia || !nota) return;

    const html = gerarEmailOcorrencia(ocorrencia, nota);

    setEmailTemplate(html);
    setEmailAssunto(
      `Ocorrência - NF ${nota.numeroNf} - ${getTipoLabel(tipoOcorrencia)}`,
    );
    setMostrarEmail(true);

    toast.success("Template da ocorrência gerado.");
  };

  const copiarEmail = async () => {
    if (!emailTemplate) return;

    setCopiandoEmail(true);

    try {
      const container = document.createElement("div");
      container.innerHTML = emailTemplate;

      const textoPlano = container.textContent?.trim() || emailTemplate;

      if (navigator.clipboard?.write && typeof ClipboardItem !== "undefined") {
        const htmlBlob = new Blob([emailTemplate], { type: "text/html" });
        const textoBlob = new Blob([textoPlano], { type: "text/plain" });

        await navigator.clipboard.write([
          new ClipboardItem({
            "text/html": htmlBlob,
            "text/plain": textoBlob,
          }),
        ]);
      } else {
        await navigator.clipboard.writeText(textoPlano);
      }

      toast.success("E-mail copiado. Agora é só colar no Outlook.");
    } catch {
      toast.error("Não foi possível copiar o e-mail.");
    } finally {
      setCopiandoEmail(false);
    }
  };

  const fecharEmailModal = () => {
    if (copiandoEmail) return;

    setMostrarEmail(false);
    setEmailTemplate("");
    setEmailAssunto("");
  };

  const registrarOcorrencia = async () => {
    if (!nota || !validarOcorrencia()) return;

    try {
      setSalvando(true);

      const ocorrencia = montarDadosOcorrencia();

      if (!ocorrencia) return;

      const response = await fetch(`${API_URL}/api/ocorrencias`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify(ocorrencia),
      });

      const data = await response.json();

      if (!response.ok) {
        const mensagem =
          data.error || "Não foi possível registrar a ocorrência.";

        setErro(mensagem);
        toast.error(mensagem);

        return;
      }

      toast.success(`${getTipoLabel(tipoOcorrencia)} registrada com sucesso!`);

      setOcorrencias((current) => [
        ...current,
        {
          id: data.ocorrencia?.id || crypto.randomUUID(),
          numeroNf: nota.numeroNf,
          totalPeso: ocorrencia.totalPeso,
          totalValor: ocorrencia.totalValor,
          valorNota: ocorrencia.valorNota,
          pesoNota: ocorrencia.pesoNota,
          dataRef: new Date().toISOString(),
          motivo: ocorrencia.motivo,
          status: "pendente",
        },
      ]);

      setTimeout(() => {
        fecharModal();
      }, 700);
    } catch {
      const mensagem = "Falha ao conectar com o servidor.";

      setErro(mensagem);
      toast.error(mensagem);
    } finally {
      setSalvando(false);
    }
  };

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <Box
      p={{
        base: "18px",
        lg: "30px",
      }}
      maxW="1500px"
      mx="auto"
      color={COLORS.text}
    >
      {/* HEADER */}

      <Flex
        justify="space-between"
        align={{
          base: "flex-start",
          md: "center",
        }}
        gap="20px"
        mb="26px"
        direction={{
          base: "column",
          md: "row",
        }}
      >
        <Box>
          <Heading
            fontSize={{
              base: "22px",
              lg: "25px",
            }}
            fontWeight="650"
            letterSpacing="-0.02em"
          >
            Operação
          </Heading>

          <Text color={COLORS.secondary} fontSize="13px" mt="5px">
            Visão geral das ocorrências e consulta de Notas Fiscais.
          </Text>
        </Box>

        <Badge
          bg={COLORS.greenSoft}
          color={COLORS.green}
          borderRadius="6px"
          px="9px"
          py="5px"
          fontSize="10px"
          fontWeight="700"
          letterSpacing=".05em"
        >
          OPERAÇÃO ATIVA
        </Badge>
      </Flex>

      {/* DASHBOARD */}

      <Box mb="28px">
        <Flex align="center" justify="space-between" mb="10px">
          <Text
            fontSize="11px"
            fontWeight="700"
            color={COLORS.secondary}
            letterSpacing=".09em"
          >
            RESUMO DO MÊS
          </Text>

          <Text fontSize="11px" color={COLORS.muted}>
            Ocorrências registradas
          </Text>
        </Flex>

        <Box
          display="grid"
          gridTemplateColumns={{
            base: "1fr",
            sm: "1fr 1fr",
            xl: "repeat(4, 1fr)",
          }}
          gap="10px"
        >
          <MetricCard
            label="Total no mês"
            value={`${totalOcorrencias} ${
              totalOcorrencias === 1 ? "ocorrência" : "ocorrências"
            }`}
            icon={FileText}
            accent={COLORS.text}
            background="rgba(148,163,184,.08)"
            loading={dashboardLoading}
          />

          <MetricCard
            label="Peso afetado"
            value={`${numberBR(totalPesoAfetado)} kg`}
            icon={Weight}
            accent={COLORS.orange}
            background={COLORS.orangeSoft}
            loading={dashboardLoading}
          />

          <MetricCard
            label="Valor afetado"
            value={money(totalValorAfetado)}
            icon={CircleDollarSign}
            accent={COLORS.blue}
            background={COLORS.blueSoft}
            loading={dashboardLoading}
          />

          <MetricCard
            label="Notas envolvidas"
            value={`${totalNfs} ${totalNfs === 1 ? "NF" : "NFs"}`}
            icon={ClipboardCheck}
            accent={COLORS.green}
            background={COLORS.greenSoft}
            loading={dashboardLoading}
          />
        </Box>
      </Box>

      {/* BUSCA */}

      <Box
        bg={COLORS.card}
        border="1px solid"
        borderColor={COLORS.border}
        borderRadius="6px"
        p={{
          base: "18px",
          lg: "22px",
        }}
      >
        <HStack gap="8px">
          <Flex
            w="28px"
            h="28px"
            borderRadius="6px"
            align="center"
            justify="center"
            bg={COLORS.blueSoft}
            color={COLORS.blue}
          >
            <Search size={15} />
          </Flex>

          <Text fontSize="15px" fontWeight="650">
            Buscar Nota Fiscal
          </Text>
        </HStack>

        <Text color={COLORS.secondary} fontSize="12px" mt="6px" ml="36px">
          Consulte uma NF para visualizar os itens e registrar uma ocorrência.
        </Text>

        <HStack gap="9px" mt="20px" align="stretch">
          <Input
            value={termo}
            onChange={(e) => setTermo(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                abrirNota();
              }
            }}
            placeholder="Digite o número da NF"
            bg={COLORS.bg}
            borderColor={COLORS.borderHover}
            color={COLORS.text}
            h="40px"
            fontSize="13px"
            _placeholder={{
              color: COLORS.muted,
            }}
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
            h="40px"
            px="20px"
            fontSize="13px"
            flexShrink={0}
            _hover={{
              bg: COLORS.blueHover,
            }}
          >
            <Search size={15} />
            Pesquisar
          </Button>
        </HStack>

        {erro && !nota && (
          <Text color={COLORS.danger} mt="10px" fontSize="12px">
            {erro}
          </Text>
        )}
      </Box>

      {/* =====================================================
          MODAL
      ===================================================== */}

      {nota && (
        <Box
          position="fixed"
          inset="0"
          zIndex={1000}
          bg="rgba(0,0,0,.72)"
          display="flex"
          alignItems="center"
          justifyContent="center"
          p={{
            base: "8px",
            md: "16px",
          }}
          onClick={fecharModal}
        >
          <Box
            width="100%"
            maxW="1200px"
            maxH="94vh"
            display="flex"
            flexDirection="column"
            overflow="hidden"
            bg={COLORS.card}
            border="1px solid"
            borderColor={COLORS.borderHover}
            borderRadius="10px"
            boxShadow="0 24px 80px rgba(0,0,0,.45)"
            onClick={(e) => e.stopPropagation()}
          >
            {/* MODAL HEADER */}

            <Flex
              px={{
                base: "16px",
                lg: "22px",
              }}
              py="13px"
              borderBottom="1px solid"
              borderColor={COLORS.border}
              justify="space-between"
              align="center"
              flexShrink={0}
              bg={COLORS.card}
            >
              <Box>
                <HStack gap="8px">
                  <PackageCheck size={18} color={COLORS.blue} />

                  <Heading
                    fontSize={{
                      base: "16px",
                      lg: "18px",
                    }}
                    fontWeight="650"
                  >
                    Nota Fiscal #{nota.numeroNf}
                  </Heading>
                </HStack>

                <Text color={COLORS.secondary} fontSize="11px" mt="3px">
                  Dados da nota e registro de ocorrência
                </Text>
              </Box>

              <Button
                variant="ghost"
                onClick={fecharModal}
                disabled={salvando}
                minW="32px"
                w="32px"
                h="32px"
                p="0"
                color={COLORS.secondary}
                _hover={{
                  bg: "rgba(255,255,255,.05)",
                  color: COLORS.text,
                }}
              >
                <X size={18} />
              </Button>
            </Flex>

            {/* MODAL CONTENT */}

            <Box
              px={{
                base: "12px",
                md: "16px",
                lg: "20px",
              }}
              py="14px"
              overflow="hidden"
              flex="1"
              minH="0"
            >
              {/* RESUMO DA NF */}

              <Box
                display="grid"
                gridTemplateColumns={{
                  base: "1fr",
                  md: "1.6fr 1fr 1.15fr",
                }}
                gap="10px"
                mb="16px"
              >
                <InfoCard label="CLIENTE">
                  <Text fontSize="12px" fontWeight="600" mt="4px">
                    {nota.cliente || "Não informado"}
                  </Text>

                  <Text fontSize="10px" color={COLORS.secondary} mt="1px">
                    Código: {nota.codigoCliente || "—"}
                  </Text>
                </InfoCard>

                <InfoCard label="VENDEDOR">
                  <Text fontSize="12px" fontWeight="600" mt="4px">
                    {nota.vendedor || "Não informado"}
                  </Text>
                </InfoCard>

                <InfoCard label="INFORMAÇÕES">
                  <HStack
                    justify="space-between"
                    align="stretch"
                    gap="24px"
                    mt="4px"
                  >
                    <Box flex="1">
                      <Text fontSize="9px" color={COLORS.muted}>
                        VALOR
                      </Text>

                      <Text fontSize="12px" fontWeight="600" mt="1px">
                        {money(Number(nota.valor || 0))}
                      </Text>
                    </Box>

                    {exigePeso && !isReentrega && (
                      <Box flex="1">
                        <Text fontSize="9px" color={COLORS.muted}>
                          PESO
                        </Text>

                        <Text fontSize="12px" fontWeight="600" mt="1px">
                          {numberBR(Number(nota.peso || nota.pesoLiquido || 0))}{" "}
                          kg
                        </Text>
                      </Box>
                    )}
                  </HStack>
                </InfoCard>
              </Box>

              {/* TIPO DA OCORRÊNCIA */}

              <Box
                mb="12px"
                display="grid"
                gridTemplateColumns={{
                  base: "1fr",
                  md: "1fr 1fr",
                }}
                gap="10px"
              >
                <Box>
                  <Text
                    fontSize="10px"
                    color={COLORS.secondary}
                    fontWeight="700"
                    mb="5px"
                  >
                    TIPO DA OCORRÊNCIA
                  </Text>

                  <select
                    value={tipoOcorrencia}
                    onChange={(e) =>
                      selecionarTipo(e.target.value as TipoOcorrencia)
                    }
                    style={{
                      width: "100%",
                      height: "36px",
                      borderRadius: "6px",
                      border: `1px solid ${COLORS.borderHover}`,
                      background: COLORS.bg,
                      color: COLORS.text,
                      padding: "0 10px",
                      fontSize: "12px",
                    }}
                  >
                    <option value="local_fechado">Local fechado</option>

                    <option value="quebra_peso">Quebra de peso</option>

                    <option value="parcial">Devolução parcial</option>

                    <option value="total">Devolução total</option>
                    <option value="reentrega">Reentrega</option>
                  </select>
                </Box>

                <Box
                  p="10px"
                  bg={
                    tipoOcorrencia === "local_fechado"
                      ? COLORS.orangeSoft
                      : tipoOcorrencia === "quebra_peso"
                        ? COLORS.purpleSoft
                        : tipoOcorrencia === "reentrega"
                          ? COLORS.greenSoft
                          : COLORS.blueSoft
                  }
                  border="1px solid"
                  borderColor={
                    tipoOcorrencia === "local_fechado"
                      ? "rgba(245,158,11,.18)"
                      : tipoOcorrencia === "quebra_peso"
                        ? "rgba(167,139,250,.18)"
                        : tipoOcorrencia === "reentrega"
                          ? "rgba(52,211,153,.18)"
                          : "rgba(59,130,246,.18)"
                  }
                  borderRadius="6px"
                  alignSelf="end"
                  minH="36px"
                >
                  <Text
                    fontSize="8px"
                    fontWeight="700"
                    letterSpacing=".08em"
                    color={COLORS.muted}
                    textTransform="uppercase"
                  >
                    Ocorrência selecionada
                  </Text>

                  <Text
                    fontSize="12px"
                    fontWeight="700"
                    mt="2px"
                    color={
                      tipoOcorrencia === "local_fechado"
                        ? COLORS.orange
                        : tipoOcorrencia === "quebra_peso"
                          ? COLORS.purple
                          : tipoOcorrencia === "reentrega"
                            ? COLORS.green
                            : COLORS.blue
                    }
                  >
                    {getTipoLabel(tipoOcorrencia)}
                  </Text>
                </Box>
              </Box>

              {/* =================================================
                  ITENS
              ================================================= */}

              {exigePeso && (
                <>
                  <Flex align="center" gap="7px" mb="8px">
                    <Calculator size={15} color={COLORS.blue} />

                    <Text fontSize="13px" fontWeight="650">
                      Itens da nota
                    </Text>

                    <Badge
                      bg="rgba(148,163,184,.08)"
                      color={COLORS.secondary}
                      borderRadius="3px"
                      px="6px"
                      py="1px"
                      fontSize="9px"
                    >
                      {itens.length}
                    </Badge>
                  </Flex>

                  {/* TABELA */}

                  <Box
                    border="1px solid"
                    borderColor={COLORS.border}
                    borderRadius="4px"
                    overflow="hidden"
                  >
                    <Box
                      minW="820px"
                      display="grid"
                      gridTemplateColumns="minmax(300px, 1fr) 110px 130px 160px 150px"
                      gap="12px"
                      px="14px"
                      py="7px"
                      minH="32px"
                      bg="#171A21"
                      color={COLORS.secondary}
                      fontSize="8px"
                      fontWeight="700"
                      borderBottom="1px solid"
                      borderColor={COLORS.border}
                    >
                      <Text>ITEM</Text>

                      <Text>PESO NF</Text>

                      <Text>VALOR/KG</Text>

                      <Text>
                        {tipoOcorrencia === "quebra_peso"
                          ? "PESO FALTANTE"
                          : "PESO DEVOLVIDO"}
                      </Text>

                      <Text>
                        {tipoOcorrencia === "quebra_peso"
                          ? "VALOR AFETADO"
                          : "VALOR DEVOLUÇÃO"}
                      </Text>
                    </Box>

                    {/* SOMENTE ESTA ÁREA TEM SCROLL */}

                    <Box
                      height={{
                        base: "170px",
                        md: "205px",
                        lg: "225px",
                      }}
                      overflowY="auto"
                      overflowX="auto"
                      css={{
                        scrollBehavior: "smooth",

                        "&::-webkit-scrollbar": {
                          width: "6px",
                          height: "6px",
                        },

                        "&::-webkit-scrollbar-track": {
                          background: "transparent",
                        },

                        "&::-webkit-scrollbar-thumb": {
                          background: "#303641",
                          borderRadius: "6px",
                        },

                        "&::-webkit-scrollbar-thumb:hover": {
                          background: "#3B4350",
                        },

                        scrollbarWidth: "thin",
                        scrollbarColor: "#303641 transparent",
                      }}
                    >
                      <Box minW="820px">
                        {itensCalculados.map((item, index) => (
                          <Box
                            key={item.id || index}
                            display="grid"
                            gridTemplateColumns="minmax(300px, 1fr) 110px 130px 160px 150px"
                            gap="12px"
                            alignItems="center"
                            px="14px"
                            py="7px"
                            minH="50px"
                            borderTop={index === 0 ? "none" : "1px solid"}
                            borderColor={COLORS.border}
                          >
                            <Box>
                              <Text
                                fontSize="11px"
                                fontWeight="600"
                                lineHeight="1.2"
                              >
                                {item.descricao || "Item sem descrição"}
                              </Text>

                              <Text
                                fontSize="9px"
                                color={COLORS.muted}
                                mt="2px"
                              >
                                Código: {item.codigo || "—"}
                              </Text>
                            </Box>

                            <Text fontSize="11px">
                              {numberBR(Number(item.pesoLiquido || 0))} kg
                            </Text>

                            <Text fontSize="11px">
                              {money(Number(item.valorUnitario || 0))}
                              /kg
                            </Text>

                            <Input
                              type="number"
                              min={0}
                              max={Number(item.pesoLiquido || 0)}
                              step="0.001"
                              value={item.pesoDevolvido || ""}
                              onChange={(e) =>
                                alterarPeso(index, e.target.value)
                              }
                              bg={COLORS.bg}
                              borderColor={COLORS.borderHover}
                              color={COLORS.text}
                              h="32px"
                              fontSize="11px"
                            />

                            <Text
                              fontSize="11px"
                              fontWeight="600"
                              color={
                                tipoOcorrencia === "quebra_peso"
                                  ? COLORS.purple
                                  : "#60A5FA"
                              }
                            >
                              {money(item.valorDevolucao)}
                            </Text>
                          </Box>
                        ))}
                      </Box>
                    </Box>
                  </Box>

                  {/* RESUMO */}

                  <Box
                    display="grid"
                    gridTemplateColumns={{
                      base: "1fr",
                      md: "1fr 1fr",
                    }}
                    gap="10px"
                    mt="10px"
                  >
                    <Box
                      px="12px"
                      py="9px"
                      bg={
                        tipoOcorrencia === "quebra_peso"
                          ? COLORS.purpleSoft
                          : COLORS.blueSoft
                      }
                      border="1px solid"
                      borderColor={
                        tipoOcorrencia === "quebra_peso"
                          ? "rgba(167,139,250,.18)"
                          : "rgba(59,130,246,.18)"
                      }
                      borderRadius="6px"
                    >
                      <Flex justify="space-between">
                        <Text color={COLORS.secondary} fontSize="11px">
                          {tipoOcorrencia === "quebra_peso"
                            ? "Peso afetado"
                            : "Peso devolvido"}
                        </Text>

                        <Text fontSize="11px" fontWeight="600">
                          {numberBR(totalPesoDevolvido)} kg
                        </Text>
                      </Flex>

                      <Flex justify="space-between" mt="3px">
                        <Text color={COLORS.secondary} fontSize="11px">
                          {tipoOcorrencia === "quebra_peso"
                            ? "Valor afetado"
                            : "Valor da devolução"}
                        </Text>

                        <Text
                          fontSize="11px"
                          fontWeight="700"
                          color={
                            tipoOcorrencia === "quebra_peso"
                              ? COLORS.purple
                              : "#60A5FA"
                          }
                        >
                          {money(totalValorDevolucao)}
                        </Text>
                      </Flex>
                    </Box>

                    <Box
                      px="12px"
                      py="9px"
                      bg={COLORS.bg}
                      border="1px solid"
                      borderColor={COLORS.border}
                      borderRadius="6px"
                    >
                      <Text
                        fontSize="8px"
                        color={COLORS.muted}
                        fontWeight="700"
                        letterSpacing=".07em"
                      >
                        TIPO DA OCORRÊNCIA
                      </Text>

                      <Text fontSize="11px" fontWeight="600" mt="3px">
                        {getTipoLabel(tipoOcorrencia)}
                      </Text>

                      {tipoOcorrencia === "quebra_peso" && (
                        <Text fontSize="9px" color={COLORS.secondary} mt="2px">
                          Divergência identificada no recebimento.
                        </Text>
                      )}
                    </Box>
                  </Box>
                </>
              )}

              {/* LOCAL FECHADO */}

              {isLocalFechado && (
                <Box
                  mt="4px"
                  px="14px"
                  py="12px"
                  bg={COLORS.orangeSoft}
                  border="1px solid"
                  borderColor="rgba(245,158,11,.18)"
                  borderRadius="6px"
                >
                  <Text
                    fontSize="9px"
                    fontWeight="700"
                    letterSpacing=".08em"
                    color={COLORS.orange}
                  >
                    LOCAL FECHADO
                  </Text>

                  <Text
                    fontSize="11px"
                    color={COLORS.secondary}
                    mt="4px"
                    lineHeight="1.5"
                  >
                    Esta ocorrência não possui peso, itens ou valor de
                    devolução. Informe na observação o motivo e as informações
                    relevantes sobre a tentativa de entrega.
                  </Text>
                </Box>
              )}

              {/* REENTREGA */}

              {isReentrega && (
                <Box
                  mt="4px"
                  px="14px"
                  py="12px"
                  bg={COLORS.greenSoft}
                  border="1px solid"
                  borderColor="rgba(52,211,153,.18)"
                  borderRadius="6px"
                >
                  <Text
                    fontSize="9px"
                    fontWeight="700"
                    letterSpacing=".08em"
                    color={COLORS.green}
                  >
                    REENTREGA
                  </Text>
                  <Text
                    fontSize="11px"
                    color={COLORS.secondary}
                    mt="4px"
                    lineHeight="1.5"
                  >
                    Registre esta ocorrência quando a Nota Fiscal precisar de
                    uma nova tentativa de entrega. Informe na observação os
                    detalhes necessários para a próxima entrega.
                  </Text>
                </Box>
              )}

              {/* OBSERVAÇÃO */}

              <Box mt="10px">
                <Text
                  fontSize="10px"
                  color={COLORS.secondary}
                  fontWeight="700"
                  mb="5px"
                >
                  OBSERVAÇÃO / MOTIVO
                </Text>

                <Textarea
                  value={observacao}
                  onChange={(e) => setObservacao(e.target.value)}
                  placeholder={
                    tipoOcorrencia === "local_fechado"
                      ? "Ex.: cliente estava fechado no momento da entrega."
                      : tipoOcorrencia === "reentrega"
                        ? "Ex.: reentregar após contato com o cliente. Nova tentativa combinada para amanhã."
                        : tipoOcorrencia === "quebra_peso"
                          ? "Ex.: caixa recebida com 2 kg a menos que o peso informado na NF."
                          : "Ex.: recusa por perda de vácuo."
                  }
                  minH="48px"
                  maxH="58px"
                  resize="none"
                  bg={COLORS.bg}
                  borderColor={COLORS.borderHover}
                  color={COLORS.text}
                  fontSize="11px"
                  _placeholder={{
                    color: COLORS.muted,
                  }}
                  _focus={{
                    borderColor: COLORS.blue,
                    boxShadow: `0 0 0 1px ${COLORS.blue}`,
                  }}
                />
              </Box>

              {erro && (
                <Text color={COLORS.danger} mt="7px" fontSize="11px">
                  {erro}
                </Text>
              )}
            </Box>

            {/* =================================================
                FOOTER FIXO
            ================================================= */}

            <Flex
              px={{
                base: "16px",
                lg: "20px",
              }}
              py="11px"
              borderTop="1px solid"
              borderColor={COLORS.border}
              justify="flex-end"
              gap="8px"
              flexShrink={0}
              bg={COLORS.card}
            >
              <Button
                variant="outline"
                borderColor={COLORS.borderHover}
                color={COLORS.text}
                onClick={fecharModal}
                disabled={salvando}
                h="34px"
                px="14px"
                fontSize="11px"
                _hover={{
                  bg: COLORS.cardHover,
                  borderColor: COLORS.borderHover,
                }}
              >
                Cancelar
              </Button>

              <Button
                variant="outline"
                borderColor="rgba(167,139,250,.35)"
                color={COLORS.purple}
                onClick={gerarOcorrencia}
                disabled={salvando || copiandoEmail}
                h="34px"
                px="15px"
                fontSize="11px"
                _hover={{
                  bg: COLORS.purpleSoft,
                  borderColor: COLORS.purple,
                }}
              >
                <Mail size={14} />
                Gerar ocorrência
              </Button>

              <Button
                bg={COLORS.blue}
                color="white"
                onClick={registrarOcorrencia}
                loading={salvando}
                h="34px"
                px="16px"
                fontSize="11px"
                _hover={{
                  bg: COLORS.blueHover,
                }}
              >
                {getBotaoLabel(tipoOcorrencia)}
              </Button>
            </Flex>
          </Box>
        </Box>
      )}

      {/* =====================================================
          MODAL DO E-MAIL
      ===================================================== */}

      {mostrarEmail && emailTemplate && (
        <Box
          position="fixed"
          inset="0"
          zIndex={1100}
          bg="rgba(0,0,0,.78)"
          display="flex"
          alignItems="center"
          justifyContent="center"
          p={{ base: "8px", md: "16px" }}
          onClick={fecharEmailModal}
        >
          <Box
            width="100%"
            maxW="1000px"
            height={{ base: "94vh", lg: "90vh" }}
            display="flex"
            flexDirection="column"
            overflow="hidden"
            bg={COLORS.card}
            border="1px solid"
            borderColor={COLORS.borderHover}
            borderRadius="10px"
            boxShadow="0 24px 80px rgba(0,0,0,.5)"
            onClick={(e) => e.stopPropagation()}
          >
            <Flex
              px={{ base: "16px", lg: "20px" }}
              py="13px"
              borderBottom="1px solid"
              borderColor={COLORS.border}
              justify="space-between"
              align="center"
              flexShrink={0}
            >
              <Box>
                <HStack gap="8px">
                  <Mail size={17} color={COLORS.purple} />
                  <Heading fontSize="17px" fontWeight="650">
                    Ocorrência gerada
                  </Heading>
                </HStack>

                <Text color={COLORS.secondary} fontSize="11px" mt="3px">
                  Revise o modelo e copie para o Outlook. As fotos podem ser
                  anexadas manualmente depois.
                </Text>
              </Box>

              <Button
                variant="ghost"
                onClick={fecharEmailModal}
                minW="32px"
                w="32px"
                h="32px"
                p="0"
                color={COLORS.secondary}
                _hover={{
                  bg: "rgba(255,255,255,.05)",
                  color: COLORS.text,
                }}
              >
                <X size={18} />
              </Button>
            </Flex>

            <Box px={{ base: "14px", md: "18px" }} py="12px" flexShrink={0}>
              <Text
                fontSize="9px"
                color={COLORS.secondary}
                fontWeight="700"
                letterSpacing=".08em"
                mb="5px"
              >
                ASSUNTO
              </Text>

              <Input
                value={emailAssunto}
                onChange={(e) => setEmailAssunto(e.target.value)}
                bg={COLORS.bg}
                borderColor={COLORS.borderHover}
                color={COLORS.text}
                h="36px"
                fontSize="11px"
              />
            </Box>

            <Box
              flex="1"
              minH="0"
              mx={{ base: "14px", md: "18px" }}
              mb="12px"
              border="1px solid"
              borderColor={COLORS.border}
              borderRadius="6px"
              overflow="hidden"
              bg="white"
            >
              <iframe
                title="Pré-visualização da ocorrência"
                srcDoc={emailTemplate}
                style={{
                  width: "100%",
                  height: "100%",
                  border: "0",
                  background: "#ffffff",
                }}
              />
            </Box>

            <Flex
              px={{ base: "16px", lg: "20px" }}
              py="11px"
              borderTop="1px solid"
              borderColor={COLORS.border}
              justify="flex-end"
              gap="8px"
              flexShrink={0}
            >
              <Button
                variant="outline"
                borderColor={COLORS.borderHover}
                color={COLORS.text}
                onClick={fecharEmailModal}
                h="34px"
                px="14px"
                fontSize="11px"
                _hover={{
                  bg: COLORS.cardHover,
                }}
              >
                Fechar
              </Button>

              <Button
                bg={COLORS.purple}
                color="#111318"
                onClick={copiarEmail}
                loading={copiandoEmail}
                h="34px"
                px="16px"
                fontSize="11px"
                fontWeight="700"
                _hover={{
                  bg: "#8B5CF6",
                }}
              >
                {copiandoEmail ? <Check size={14} /> : <Copy size={14} />}
                {copiandoEmail ? "Copiando..." : "Copiar e-mail"}
              </Button>
            </Flex>
          </Box>
        </Box>
      )}
    </Box>
  );
}
