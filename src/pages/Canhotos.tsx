import { useMemo, useState } from "react";

import {
  CheckCircle2,
  ClipboardCheck,
  FileCheck,
  Search,
  X,
} from "lucide-react";

import {
  Badge,
  Box,
  Button,
  Flex,
  Heading,
  HStack,
  Input,
  Text,
} from "@chakra-ui/react";

/* =========================================================
   TIPOS
========================================================= */

type StatusCanhoto = "pendente" | "baixado";

interface Canhoto {
  id: string;
  numeroNf: string;
  cliente: string;
  motorista: string;
  cidade: string;
  data: string;
  ocorrencia: string | null;
  status: StatusCanhoto;
  registradoPor: string;
  observacao?: string;
}

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

  green: "#34D399",
  greenSoft: "rgba(52,211,153,.10)",

  orange: "#F59E0B",
  orangeSoft: "rgba(245,158,11,.10)",
};

/* =========================================================
   DADOS TEMPORÁRIOS
========================================================= */

const MOCK_CANHOTOS: Canhoto[] = [
  {
    id: "1",
    numeroNf: "NF12345",
    cliente: "Cliente Exemplo Ltda.",
    motorista: "João da Silva",
    cidade: "Indaiatuba",
    data: "2026-09-22",
    ocorrencia: null,
    status: "pendente",
    registradoPor: "Sistema",
    observacao: "Canhoto aguardando baixa.",
  },

  {
    id: "2",
    numeroNf: "NF12346",
    cliente: "Mercado Central",
    motorista: "Carlos Oliveira",
    cidade: "Campinas",
    data: "2026-09-22",
    ocorrencia: "Reentrega",
    status: "pendente",
    registradoPor: "Sistema",
    observacao: "Canhoto relacionado a uma reentrega.",
  },

  {
    id: "3",
    numeroNf: "NF12347",
    cliente: "Distribuidora Paulista",
    motorista: "Marcos Santos",
    cidade: "Sorocaba",
    data: "2026-09-21",
    ocorrencia: null,
    status: "baixado",
    registradoPor: "Sistema",
    observacao: "Entrega realizada normalmente.",
  },

  {
    id: "4",
    numeroNf: "NF12348",
    cliente: "Comercial São Paulo",
    motorista: "Rafael Souza",
    cidade: "Jundiaí",
    data: "2026-09-21",
    ocorrencia: "Devolução parcial",
    status: "pendente",
    registradoPor: "Sistema",
    observacao: "Entrega com devolução parcial.",
  },
];

/* =========================================================
   HELPERS
========================================================= */

function formatarData(data: string) {
  if (!data) {
    return "—";
  }

  const [ano, mes, dia] = data.split("-");

  if (!ano || !mes || !dia) {
    return data;
  }

  return `${dia}/${mes}/${ano}`;
}

function normalizarTexto(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function getStatusLabel(status: StatusCanhoto) {
  return status === "baixado" ? "Baixado" : "Pendente";
}

/* =========================================================
   COMPONENTE
========================================================= */

export default function Canhotos() {
  const [canhotos] = useState<Canhoto[]>(MOCK_CANHOTOS);

  const [busca, setBusca] = useState("");

  const [statusFiltro, setStatusFiltro] = useState<"todos" | StatusCanhoto>(
    "todos",
  );

  const [periodo, setPeriodo] = useState<"todos" | "hoje" | "7" | "30">(
    "todos",
  );

  const [canhotoSelecionado, setCanhotoSelecionado] = useState<Canhoto | null>(
    null,
  );

  /* =======================================================
     FILTROS
  ======================================================= */

  const canhotosFiltrados = useMemo(() => {
    const termo = normalizarTexto(busca);

    const hoje = new Date();

    return canhotos.filter((item) => {
      const correspondeBusca =
        !termo ||
        normalizarTexto(item.numeroNf).includes(termo) ||
        normalizarTexto(item.cliente).includes(termo) ||
        normalizarTexto(item.motorista).includes(termo) ||
        normalizarTexto(item.cidade).includes(termo);

      const correspondeStatus =
        statusFiltro === "todos" || item.status === statusFiltro;

      let correspondePeriodo = true;

      if (periodo !== "todos") {
        const dataItem = new Date(`${item.data}T00:00:00`);

        if (periodo === "hoje") {
          correspondePeriodo = dataItem.toDateString() === hoje.toDateString();
        }

        if (periodo === "7") {
          const limite = new Date(hoje);

          limite.setHours(0, 0, 0, 0);
          limite.setDate(hoje.getDate() - 6);

          correspondePeriodo = dataItem >= limite;
        }

        if (periodo === "30") {
          const limite = new Date(hoje);

          limite.setHours(0, 0, 0, 0);
          limite.setDate(hoje.getDate() - 29);

          correspondePeriodo = dataItem >= limite;
        }
      }

      return correspondeBusca && correspondeStatus && correspondePeriodo;
    });
  }, [canhotos, busca, statusFiltro, periodo]);

  /* =======================================================
     INDICADORES
  ======================================================= */

  const total = canhotosFiltrados.length;

  const pendentes = canhotosFiltrados.filter(
    (item) => item.status === "pendente",
  ).length;

  const baixados = canhotosFiltrados.filter(
    (item) => item.status === "baixado",
  ).length;

  /* =======================================================
     LIMPAR FILTROS
  ======================================================= */

  function limparFiltros() {
    setBusca("");
    setStatusFiltro("todos");
    setPeriodo("todos");
  }

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <>
      {/* ===================================================
          ESTILOS LOCAIS
      =================================================== */}

      <style>
        {`
          .canhotos-scroll {
            overflow-x: auto;
          }

          .canhotos-scroll::-webkit-scrollbar {
            height: 6px;
          }

          .canhotos-scroll::-webkit-scrollbar-track {
            background: transparent;
          }

          .canhotos-scroll::-webkit-scrollbar-thumb {
            background: #303641;
            border-radius: 6px;
          }

          .canhotos-scroll::-webkit-scrollbar-thumb:hover {
            background: #3B4350;
          }
        `}
      </style>

      <Box
        minH="100%"
        bg={COLORS.bg}
        color={COLORS.text}
        px={{
          base: "16px",
          md: "24px",
          lg: "30px",
        }}
        py={{
          base: "20px",
          md: "26px",
        }}
      >
        {/* =================================================
            CABEÇALHO
        ================================================= */}

        <Flex
          justifyContent="space-between"
          alignItems={{
            base: "flex-start",
            md: "center",
          }}
          direction={{
            base: "column",
            md: "row",
          }}
          gap="16px"
          mb="24px"
        >
          <Box>
            <HStack gap="9px" mb="5px">
              <Box
                w="30px"
                h="30px"
                borderRadius="7px"
                bg={COLORS.blueSoft}
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <FileCheck size={16} color={COLORS.blue} />
              </Box>

              <Heading
                fontSize={{
                  base: "20px",
                  md: "23px",
                }}
                fontWeight="700"
                letterSpacing="-0.02em"
              >
                Canhotos
              </Heading>
            </HStack>

            <Text fontSize="12px" color={COLORS.secondary}>
              Controle de comprovantes de entrega.
            </Text>
          </Box>
        </Flex>

        {/* =================================================
            INDICADORES
        ================================================= */}

        <Box
          display="grid"
          gridTemplateColumns={{
            base: "1fr",
            sm: "repeat(3, 1fr)",
          }}
          gap="10px"
          mb="18px"
        >
          <Indicador label="CANHOTOS NO FILTRO" value={total} />

          <Indicador
            label="PENDENTES"
            value={pendentes}
            color={COLORS.orange}
          />

          <Indicador label="BAIXADOS" value={baixados} color={COLORS.green} />
        </Box>

        {/* =================================================
            FILTROS
        ================================================= */}

        <Box
          bg={COLORS.card}
          border="1px solid"
          borderColor={COLORS.border}
          borderRadius="8px"
          p={{
            base: "12px",
            md: "14px",
          }}
          mb="14px"
        >
          <Flex gap="9px" flexWrap="wrap" alignItems="center">
            {/* BUSCA */}

            <Flex
              position="relative"
              flex={{
                base: "1 1 100%",
                md: "1 1 280px",
              }}
              minW={{
                md: "240px",
              }}
            >
              <Search
                size={14}
                color={COLORS.muted}
                style={{
                  position: "absolute",
                  left: "11px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  pointerEvents: "none",
                }}
              />

              <Input
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Buscar NF, cliente ou motorista..."
                pl="34px"
                h="36px"
                bg={COLORS.bg}
                borderColor={COLORS.borderHover}
                color={COLORS.text}
                fontSize="11px"
                _placeholder={{
                  color: COLORS.muted,
                }}
                _focus={{
                  borderColor: COLORS.blue,
                  boxShadow: "none",
                }}
              />
            </Flex>

            {/* PERÍODO */}

            <select
              value={periodo}
              onChange={(e) =>
                setPeriodo(e.target.value as "todos" | "hoje" | "7" | "30")
              }
              style={{
                height: "36px",
                borderRadius: "6px",
                border: `1px solid ${COLORS.borderHover}`,
                background: COLORS.bg,
                color: COLORS.text,
                padding: "0 10px",
                fontSize: "11px",
                minWidth: "145px",
              }}
            >
              <option value="todos">Todos os períodos</option>

              <option value="hoje">Hoje</option>

              <option value="7">Últimos 7 dias</option>

              <option value="30">Últimos 30 dias</option>
            </select>

            {/* STATUS */}

            <select
              value={statusFiltro}
              onChange={(e) =>
                setStatusFiltro(e.target.value as "todos" | StatusCanhoto)
              }
              style={{
                height: "36px",
                borderRadius: "6px",
                border: `1px solid ${COLORS.borderHover}`,
                background: COLORS.bg,
                color: COLORS.text,
                padding: "0 10px",
                fontSize: "11px",
                minWidth: "125px",
              }}
            >
              <option value="todos">Todos os status</option>

              <option value="pendente">Pendentes</option>

              <option value="baixado">Baixados</option>
            </select>

            {/* LIMPAR */}

            {(busca || statusFiltro !== "todos" || periodo !== "todos") && (
              <Button
                onClick={limparFiltros}
                variant="ghost"
                h="36px"
                px="11px"
                color={COLORS.secondary}
                fontSize="10px"
                _hover={{
                  bg: COLORS.cardHover,
                  color: COLORS.text,
                }}
              >
                Limpar filtros
              </Button>
            )}
          </Flex>
        </Box>

        {/* =================================================
            TABELA
        ================================================= */}

        <Box
          bg={COLORS.card}
          border="1px solid"
          borderColor={COLORS.border}
          borderRadius="8px"
          overflow="hidden"
        >
          <Box className="canhotos-scroll">
            <Box minW="900px">
              {/* CABEÇALHO DA TABELA */}

              <Box
                display="grid"
                gridTemplateColumns="130px minmax(220px, 1fr) 170px 130px 120px 100px"
                gap="12px"
                px="16px"
                py="11px"
                borderBottom="1px solid"
                borderColor={COLORS.border}
              >
                <CabecalhoTabela>NF</CabecalhoTabela>

                <CabecalhoTabela>CLIENTE</CabecalhoTabela>

                <CabecalhoTabela>MOTORISTA</CabecalhoTabela>

                <CabecalhoTabela>DATA</CabecalhoTabela>

                <CabecalhoTabela>STATUS</CabecalhoTabela>

                <CabecalhoTabela align="right">AÇÃO</CabecalhoTabela>
              </Box>

              {/* CONTEÚDO */}

              {canhotosFiltrados.length === 0 ? (
                <Box py="55px" textAlign="center" px="20px">
                  <ClipboardCheck
                    size={28}
                    color={COLORS.muted}
                    style={{
                      margin: "0 auto 10px",
                    }}
                  />

                  <Text fontSize="13px" fontWeight="600">
                    Nenhum canhoto encontrado
                  </Text>

                  <Text fontSize="11px" color={COLORS.muted} mt="4px">
                    Tente alterar os filtros utilizados.
                  </Text>
                </Box>
              ) : (
                canhotosFiltrados.map((item) => (
                  <LinhaCanhoto
                    key={item.id}
                    item={item}
                    onDetails={() => setCanhotoSelecionado(item)}
                  />
                ))
              )}
            </Box>
          </Box>
        </Box>

        {/* =================================================
            MODAL
        ================================================= */}

        {canhotoSelecionado && (
          <ModalCanhoto
            canhoto={canhotoSelecionado}
            onClose={() => setCanhotoSelecionado(null)}
          />
        )}
      </Box>
    </>
  );
}

/* =========================================================
   INDICADOR
========================================================= */

function Indicador({
  label,
  value,
  color = COLORS.text,
}: {
  label: string;
  value: number;
  color?: string;
}) {
  return (
    <Box
      bg={COLORS.card}
      border="1px solid"
      borderColor={COLORS.border}
      borderRadius="8px"
      px="16px"
      py="14px"
    >
      <Text
        fontSize="9px"
        fontWeight="700"
        color={COLORS.muted}
        letterSpacing=".08em"
      >
        {label}
      </Text>

      <Text fontSize="22px" fontWeight="700" mt="5px" color={color}>
        {value}
      </Text>
    </Box>
  );
}

/* =========================================================
   CABEÇALHO DA TABELA
========================================================= */

function CabecalhoTabela({
  children,
  align = "left",
}: {
  children: React.ReactNode;
  align?: "left" | "right";
}) {
  return (
    <Text
      fontSize="9px"
      fontWeight="700"
      color={COLORS.muted}
      textAlign={align}
    >
      {children}
    </Text>
  );
}

/* =========================================================
   LINHA
========================================================= */

function LinhaCanhoto({
  item,
  onDetails,
}: {
  item: Canhoto;
  onDetails: () => void;
}) {
  return (
    <Box
      display="grid"
      gridTemplateColumns="130px minmax(220px, 1fr) 170px 130px 120px 100px"
      gap="12px"
      alignItems="center"
      px="16px"
      py="13px"
      borderBottom="1px solid"
      borderColor={COLORS.border}
      transition="background .15s ease"
      _hover={{
        bg: COLORS.cardHover,
      }}
    >
      {/* NF */}

      <Box>
        <Text fontSize="12px" fontWeight="700">
          {item.numeroNf}
        </Text>

        {item.ocorrencia && (
          <Text fontSize="9px" color={COLORS.orange} mt="3px">
            {item.ocorrencia}
          </Text>
        )}
      </Box>

      {/* CLIENTE */}

      <Box>
        <Text fontSize="11px" fontWeight="600">
          {item.cliente}
        </Text>

        <Text fontSize="9px" color={COLORS.muted} mt="3px">
          {item.cidade}
        </Text>
      </Box>

      {/* MOTORISTA */}

      <Text fontSize="11px" color={COLORS.secondary}>
        {item.motorista}
      </Text>

      {/* DATA */}

      <Text fontSize="11px" color={COLORS.secondary}>
        {formatarData(item.data)}
      </Text>

      {/* STATUS */}

      <Box>
        <Badge
          px="8px"
          py="4px"
          borderRadius="5px"
          fontSize="8px"
          fontWeight="700"
          bg={item.status === "baixado" ? COLORS.greenSoft : COLORS.orangeSoft}
          color={item.status === "baixado" ? COLORS.green : COLORS.orange}
        >
          {getStatusLabel(item.status)}
        </Badge>
      </Box>

      {/* AÇÃO */}

      <Flex justifyContent="flex-end">
        <Button
          onClick={onDetails}
          variant="ghost"
          h="30px"
          px="9px"
          fontSize="9px"
          color={COLORS.secondary}
          _hover={{
            bg: COLORS.blueSoft,
            color: COLORS.blue,
          }}
        >
          Detalhes
        </Button>
      </Flex>
    </Box>
  );
}

/* =========================================================
   MODAL
========================================================= */

function ModalCanhoto({
  canhoto,
  onClose,
}: {
  canhoto: Canhoto;
  onClose: () => void;
}) {
  return (
    <Box
      position="fixed"
      inset="0"
      bg="rgba(0,0,0,.65)"
      zIndex={1000}
      display="flex"
      alignItems="center"
      justifyContent="center"
      px="16px"
      onClick={onClose}
    >
      <Box
        w="100%"
        maxW="620px"
        maxH="85vh"
        overflowY="auto"
        bg={COLORS.card}
        border="1px solid"
        borderColor={COLORS.borderHover}
        borderRadius="10px"
        boxShadow="0 20px 60px rgba(0,0,0,.4)"
        onClick={(event) => event.stopPropagation()}
      >
        {/* HEADER */}

        <Flex
          justifyContent="space-between"
          alignItems="center"
          px="18px"
          py="15px"
          borderBottom="1px solid"
          borderColor={COLORS.border}
        >
          <Box>
            <Text
              fontSize="9px"
              fontWeight="700"
              color={COLORS.muted}
              letterSpacing=".08em"
            >
              DETALHES DO CANHOTO
            </Text>

            <Text fontSize="17px" fontWeight="700" mt="3px">
              {canhoto.numeroNf}
            </Text>
          </Box>

          <Button
            onClick={onClose}
            variant="ghost"
            minW="32px"
            w="32px"
            h="32px"
            p="0"
            color={COLORS.secondary}
            _hover={{
              bg: COLORS.cardHover,
              color: COLORS.text,
            }}
          >
            <X size={16} />
          </Button>
        </Flex>

        {/* BODY */}

        <Box p="18px">
          <Box
            display="grid"
            gridTemplateColumns={{
              base: "1fr",
              md: "1fr 1fr",
            }}
            gap="10px"
          >
            <InfoItem label="CLIENTE" value={canhoto.cliente} />

            <InfoItem label="MOTORISTA" value={canhoto.motorista} />

            <InfoItem label="CIDADE" value={canhoto.cidade} />

            <InfoItem label="DATA" value={formatarData(canhoto.data)} />

            <InfoItem
              label="OCORRÊNCIA"
              value={canhoto.ocorrencia || "Nenhuma"}
            />

            <InfoItem label="REGISTRADO POR" value={canhoto.registradoPor} />
          </Box>

          {/* STATUS */}

          <Box
            mt="12px"
            p="12px"
            bg={
              canhoto.status === "baixado"
                ? COLORS.greenSoft
                : COLORS.orangeSoft
            }
            border="1px solid"
            borderColor={
              canhoto.status === "baixado"
                ? "rgba(52,211,153,.18)"
                : "rgba(245,158,11,.18)"
            }
            borderRadius="7px"
          >
            <Text
              fontSize="9px"
              fontWeight="700"
              color={COLORS.muted}
              letterSpacing=".08em"
            >
              STATUS
            </Text>

            <HStack gap="6px" mt="4px">
              {canhoto.status === "baixado" && (
                <CheckCircle2 size={14} color={COLORS.green} />
              )}

              <Text
                fontSize="12px"
                fontWeight="700"
                color={
                  canhoto.status === "baixado" ? COLORS.green : COLORS.orange
                }
              >
                {getStatusLabel(canhoto.status)}
              </Text>
            </HStack>
          </Box>

          {/* OBSERVAÇÃO */}

          {canhoto.observacao && (
            <Box mt="12px">
              <Text
                fontSize="9px"
                fontWeight="700"
                color={COLORS.muted}
                letterSpacing=".08em"
                mb="5px"
              >
                OBSERVAÇÃO
              </Text>

              <Box
                bg={COLORS.bg}
                border="1px solid"
                borderColor={COLORS.border}
                borderRadius="7px"
                p="12px"
              >
                <Text fontSize="11px" color={COLORS.secondary} lineHeight="1.6">
                  {canhoto.observacao}
                </Text>
              </Box>
            </Box>
          )}
        </Box>

        {/* FOOTER */}

        <Flex
          justifyContent="flex-end"
          px="18px"
          py="13px"
          borderTop="1px solid"
          borderColor={COLORS.border}
        >
          <Button
            onClick={onClose}
            h="34px"
            px="13px"
            fontSize="10px"
            bg={COLORS.blue}
            color="white"
            _hover={{
              bg: COLORS.blueHover,
            }}
          >
            Fechar
          </Button>
        </Flex>
      </Box>
    </Box>
  );
}

/* =========================================================
   ITEM DE INFORMAÇÃO
========================================================= */

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <Box
      bg={COLORS.bg}
      border="1px solid"
      borderColor={COLORS.border}
      borderRadius="7px"
      px="12px"
      py="10px"
    >
      <Text
        fontSize="8px"
        fontWeight="700"
        color={COLORS.muted}
        letterSpacing=".08em"
      >
        {label}
      </Text>

      <Text fontSize="11px" fontWeight="600" color={COLORS.text} mt="4px">
        {value || "—"}
      </Text>
    </Box>
  );
}
