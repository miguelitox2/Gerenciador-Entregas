import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  CalendarDays,
  ChevronRight,
  Filter,
  PackageCheck,
  RefreshCw,
  Search,
  Truck,
  Plus,
  User,
  X,
} from "lucide-react";
import { toast } from "sonner";

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

import { API_URL } from "../config/api";

/* =========================================================
   TIPOS
========================================================= */

interface Ocorrencia {
  id: string;
  numeroNf?: string | null;
  numeroNfOriginal?: string | null;
  cliente?: string | null;
  vendedor?: string | null;
  motorista?: string | null;
  cidade?: string | null;
  motivo?: string | null;
  observacao?: string | null;
  unidade?: string | null;
  totalPeso?: number | null;
  totalValor?: number | null;
  valorNota?: number | null;
  pesoNota?: number | null;
  dataRef?: string | null;
  criadoEm?: string | null;
  createdAt?: string | null;
  status?: string | null;
  reentregaStatus?: string | null;
  veiculoReentregaId?: string | null;
  veiculoReentrega?: VeiculoReentrega | null;
}

interface VeiculoReentrega {
  id: string;
  placa: string;
  ativo?: boolean;
  criadoEm?: string | null;
}

type PeriodoPreset =
  | "todos"
  | "hoje"
  | "ontem"
  | "7"
  | "30"
  | "mes"
  | "personalizado";

type StatusFiltro = "todos" | "pendente" | "finalizado";
type ProgramacaoFiltro = "todos" | "a_definir" | "programada" | "nao_vai";

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

  danger: "#F87171",
};

/* =========================================================
   HELPERS
========================================================= */

function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem("token");

  return token
    ? {
        Authorization: `Bearer ${token}`,
      }
    : {};
}

function normalizeOcorrencias(data: unknown): Ocorrencia[] {
  if (Array.isArray(data)) {
    return data as Ocorrencia[];
  }

  if (
    data &&
    typeof data === "object" &&
    Array.isArray((data as { ocorrencias?: unknown }).ocorrencias)
  ) {
    return (data as { ocorrencias: Ocorrencia[] }).ocorrencias;
  }

  return [];
}

function formatDate(value?: string | null) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function formatDateTime(value?: string | null) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getOccurrenceDate(ocorrencia: Ocorrencia) {
  return (
    ocorrencia.dataRef || ocorrencia.criadoEm || ocorrencia.createdAt || null
  );
}

function toDateInputValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getToday() {
  return toDateInputValue(new Date());
}

function getYesterday() {
  const date = new Date();
  date.setDate(date.getDate() - 1);
  return toDateInputValue(date);
}

function getDaysAgo(days: number) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return toDateInputValue(date);
}

function getMonthStart() {
  const date = new Date();
  date.setDate(1);
  return toDateInputValue(date);
}

function getMonthEnd() {
  const date = new Date();
  date.setMonth(date.getMonth() + 1, 0);
  return toDateInputValue(date);
}

function getStatus(ocorrencia: Ocorrencia): "pendente" | "finalizado" {
  return ocorrencia.status?.toLowerCase() === "finalizado"
    ? "finalizado"
    : "pendente";
}

function getProgramacaoStatus(
  ocorrencia: Ocorrencia,
): "a_definir" | "programada" | "nao_vai" {
  const status = normalizeSearch(ocorrencia.reentregaStatus);

  if (status === "nao_vai") return "nao_vai";
  if (status === "programada") return "programada";
  if (ocorrencia.veiculoReentregaId || ocorrencia.veiculoReentrega?.id) {
    return "programada";
  }

  return "a_definir";
}

function getProgramacaoLabel(ocorrencia: Ocorrencia) {
  const status = getProgramacaoStatus(ocorrencia);

  if (status === "programada") return "PROGRAMADA";
  if (status === "nao_vai") return "NÃO VAI";
  return "A DEFINIR";
}

function normalizeSearch(value?: string | null) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

/* =========================================================
   COMPONENTE
========================================================= */

export default function Reentregas() {
  const [ocorrencias, setOcorrencias] = useState<Ocorrencia[]>([]);
  const [loading, setLoading] = useState(true);

  const [busca, setBusca] = useState("");
  const [periodo, setPeriodo] = useState<PeriodoPreset>("mes");
  const [status, setStatus] = useState<StatusFiltro>("todos");
  const [programacao, setProgramacao] = useState<ProgramacaoFiltro>("todos");
  const [veiculos, setVeiculos] = useState<VeiculoReentrega[]>([]);
  const [veiculoFiltro, setVeiculoFiltro] = useState("todos");
  const [salvandoReentregaId, setSalvandoReentregaId] = useState<string | null>(
    null,
  );
  const [modalVeiculoAberto, setModalVeiculoAberto] = useState(false);
  const [novaPlaca, setNovaPlaca] = useState("");
  const [salvandoVeiculo, setSalvandoVeiculo] = useState(false);

  const [dataInicial, setDataInicial] = useState(getMonthStart());
  const [dataFinal, setDataFinal] = useState(getMonthEnd());

  const [selecionada, setSelecionada] = useState<Ocorrencia | null>(null);

  /* =========================================================
     CARREGAR
  ========================================================= */

  const carregarReentregas = async () => {
    try {
      setLoading(true);

      const response = await fetch(`${API_URL}/api/ocorrencias`, {
        headers: {
          ...getAuthHeaders(),
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error || "Não foi possível carregar as reentregas.",
        );
      }

      const lista = normalizeOcorrencias(data);

      const reentregas = lista.filter(
        (ocorrencia) => normalizeSearch(ocorrencia.motivo) === "reentrega",
      );

      setOcorrencias(reentregas);
    } catch (error) {
      console.error("Erro ao carregar reentregas:", error);

      toast.error(
        error instanceof Error
          ? error.message
          : "Não foi possível carregar as reentregas.",
      );
    } finally {
      setLoading(false);
    }
  };

  const carregarVeiculos = async () => {
    try {
      const response = await fetch(`${API_URL}/api/veiculos-reentrega`, {
        headers: {
          ...getAuthHeaders(),
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error || "Não foi possível carregar os veículos de reentrega.",
        );
      }

      const lista = Array.isArray(data)
        ? data
        : Array.isArray(data?.veiculos)
          ? data.veiculos
          : [];

      setVeiculos(
        lista.filter((veiculo: VeiculoReentrega) => veiculo.ativo !== false),
      );
    } catch (error) {
      console.error("Erro ao carregar veículos de reentrega:", error);

      toast.error(
        error instanceof Error
          ? error.message
          : "Não foi possível carregar os veículos.",
      );
    }
  };

  const cadastrarVeiculo = async () => {
    const placa = novaPlaca.trim().toUpperCase();

    if (!placa) {
      toast.error("Informe a placa do veículo.");
      return;
    }

    try {
      setSalvandoVeiculo(true);

      const response = await fetch(`${API_URL}/api/veiculos-reentrega`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify({ placa }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Não foi possível cadastrar o veículo.");
      }

      const novoVeiculo = data?.veiculo || data;

      if (novoVeiculo?.id) {
        setVeiculos((atual) => {
          const semDuplicado = atual.filter(
            (item) => item.id !== novoVeiculo.id,
          );
          return [...semDuplicado, novoVeiculo].sort((a, b) =>
            a.placa.localeCompare(b.placa),
          );
        });
      } else {
        await carregarVeiculos();
      }

      setNovaPlaca("");
      setModalVeiculoAberto(false);
      toast.success("Veículo cadastrado com sucesso.");
    } catch (error) {
      console.error("Erro ao cadastrar veículo:", error);

      toast.error(
        error instanceof Error
          ? error.message
          : "Não foi possível cadastrar o veículo.",
      );
    } finally {
      setSalvandoVeiculo(false);
    }
  };

  const atualizarProgramacao = async (
    ocorrencia: Ocorrencia,
    valor: string,
  ) => {
    const reentregaStatus: "a_definir" | "programada" | "nao_vai" =
      valor === "nao_vai" ? "nao_vai" : valor ? "programada" : "a_definir";

    const veiculoReentregaId = reentregaStatus === "programada" ? valor : null;

    try {
      setSalvandoReentregaId(ocorrencia.id);

      const response = await fetch(
        `${API_URL}/api/ocorrencias/${ocorrencia.id}/reentrega`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            ...getAuthHeaders(),
          },
          body: JSON.stringify({
            reentregaStatus,
            veiculoReentregaId,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error || "Não foi possível atualizar a programação.",
        );
      }

      const atualizada: Ocorrencia = data?.ocorrencia || data;

      setOcorrencias((atual) =>
        atual.map((item) =>
          item.id === ocorrencia.id
            ? {
                ...item,
                ...atualizada,
                reentregaStatus,
                veiculoReentregaId,
                veiculoReentrega:
                  reentregaStatus === "programada"
                    ? veiculos.find(
                        (veiculo) => veiculo.id === veiculoReentregaId,
                      ) || null
                    : null,
              }
            : item,
        ),
      );

      setSelecionada((atual) =>
        atual?.id === ocorrencia.id
          ? {
              ...atual,
              ...atualizada,
              reentregaStatus,
              veiculoReentregaId,
              veiculoReentrega:
                reentregaStatus === "programada"
                  ? veiculos.find(
                      (veiculo) => veiculo.id === veiculoReentregaId,
                    ) || null
                  : null,
            }
          : atual,
      );

      if (reentregaStatus === "nao_vai") {
        toast.success("Reentrega marcada como NÃO VAI.");
      } else if (reentregaStatus === "programada") {
        const veiculo = veiculos.find((item) => item.id === veiculoReentregaId);
        toast.success(
          `Reentrega programada para o veículo ${veiculo?.placa || "selecionado"}.`,
        );
      } else {
        toast.success("Reentrega voltou para A DEFINIR.");
      }
    } catch (error) {
      console.error("Erro ao atualizar programação:", error);

      toast.error(
        error instanceof Error
          ? error.message
          : "Não foi possível atualizar a programação.",
      );
    } finally {
      setSalvandoReentregaId(null);
    }
  };

  useEffect(() => {
    carregarReentregas();
    carregarVeiculos();
  }, []);

  /* =========================================================
     PERÍODO
  ========================================================= */

  const aplicarPeriodo = (novoPeriodo: PeriodoPreset) => {
    setPeriodo(novoPeriodo);

    const hoje = getToday();

    switch (novoPeriodo) {
      case "hoje":
        setDataInicial(hoje);
        setDataFinal(hoje);
        break;

      case "ontem": {
        const ontem = getYesterday();
        setDataInicial(ontem);
        setDataFinal(ontem);
        break;
      }

      case "7":
        setDataInicial(getDaysAgo(6));
        setDataFinal(hoje);
        break;

      case "30":
        setDataInicial(getDaysAgo(29));
        setDataFinal(hoje);
        break;

      case "mes":
        setDataInicial(getMonthStart());
        setDataFinal(getMonthEnd());
        break;

      case "todos":
        setDataInicial("");
        setDataFinal("");
        break;

      case "personalizado":
        break;
    }
  };

  const alterarDataInicial = (value: string) => {
    setPeriodo("personalizado");
    setDataInicial(value);
  };

  const alterarDataFinal = (value: string) => {
    setPeriodo("personalizado");
    setDataFinal(value);
  };

  /* =========================================================
     FILTROS
  ========================================================= */

  const reentregasFiltradas = useMemo(() => {
    const termo = normalizeSearch(busca);

    return ocorrencias.filter((ocorrencia) => {
      const statusOcorrencia = getStatus(ocorrencia);

      if (status !== "todos" && statusOcorrencia !== status) {
        return false;
      }

      const dataOcorrencia = getOccurrenceDate(ocorrencia);

      if (periodo !== "todos" && dataOcorrencia) {
        const data = new Date(dataOcorrencia);

        if (!Number.isNaN(data.getTime())) {
          const dataLocal = toDateInputValue(data);

          if (dataInicial && dataLocal < dataInicial) {
            return false;
          }

          if (dataFinal && dataLocal > dataFinal) {
            return false;
          }
        }
      }

      if (periodo !== "todos" && !dataOcorrencia) {
        return false;
      }

      const statusProgramacao = getProgramacaoStatus(ocorrencia);

      if (programacao !== "todos" && statusProgramacao !== programacao) {
        return false;
      }

      if (veiculoFiltro !== "todos") {
        if (veiculoFiltro === "sem_veiculo") {
          if (statusProgramacao !== "a_definir") return false;
        } else if (ocorrencia.veiculoReentregaId !== veiculoFiltro) {
          return false;
        }
      }

      if (!termo) {
        return true;
      }

      const valores = [
        ocorrencia.numeroNf,
        ocorrencia.numeroNfOriginal,
        ocorrencia.cliente,
        ocorrencia.vendedor,
        ocorrencia.motorista,
        ocorrencia.cidade,
        ocorrencia.observacao,
      ];

      return valores.some((valor) => normalizeSearch(valor).includes(termo));
    });
  }, [
    ocorrencias,
    busca,
    periodo,
    status,
    programacao,
    veiculoFiltro,
    dataInicial,
    dataFinal,
  ]);

  /* =========================================================
     INDICADORES
  ========================================================= */

  const total = reentregasFiltradas.length;

  const totalPendentes = useMemo(
    () =>
      reentregasFiltradas.filter(
        (ocorrencia) => getStatus(ocorrencia) === "pendente",
      ).length,
    [reentregasFiltradas],
  );

  const totalFinalizadas = useMemo(
    () =>
      reentregasFiltradas.filter(
        (ocorrencia) => getStatus(ocorrencia) === "finalizado",
      ).length,
    [reentregasFiltradas],
  );

  /* =========================================================
     LIMPAR
  ========================================================= */

  const limparFiltros = () => {
    setBusca("");
    setStatus("todos");
    setProgramacao("todos");
    setVeiculoFiltro("todos");
    setPeriodo("mes");
    setDataInicial(getMonthStart());
    setDataFinal(getMonthEnd());
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
        direction={{
          base: "column",
          md: "row",
        }}
        gap="18px"
        mb="26px"
      >
        <Box>
          <HStack gap="9px">
            <Flex
              w="30px"
              h="30px"
              align="center"
              justify="center"
              borderRadius="6px"
              bg={COLORS.greenSoft}
              color={COLORS.green}
            >
              <RefreshCw size={16} />
            </Flex>

            <Heading
              fontSize={{
                base: "22px",
                lg: "25px",
              }}
              fontWeight="650"
              letterSpacing="-0.02em"
            >
              Reentregas
            </Heading>
          </HStack>

          <Text color={COLORS.secondary} fontSize="13px" mt="7px">
            Acompanhe as Notas Fiscais que precisam de uma nova tentativa de
            entrega.
          </Text>
        </Box>

        <Button
          variant="outline"
          borderColor={COLORS.borderHover}
          color={COLORS.secondary}
          onClick={() => {
            carregarReentregas();
            carregarVeiculos();
          }}
          loading={loading}
          h="34px"
          px="13px"
          fontSize="11px"
          _hover={{
            bg: COLORS.cardHover,
            color: COLORS.text,
          }}
        >
          <RefreshCw size={13} />
          Atualizar
        </Button>
      </Flex>

      {/* INDICADORES */}

      <Box
        display="grid"
        gridTemplateColumns={{
          base: "1fr",
          sm: "repeat(3, 1fr)",
        }}
        gap="10px"
        mb="18px"
      >
        <Box
          bg={COLORS.card}
          border="1px solid"
          borderColor={COLORS.border}
          borderRadius="6px"
          px="16px"
          py="14px"
        >
          <Text
            fontSize="9px"
            color={COLORS.secondary}
            fontWeight="700"
            letterSpacing=".08em"
          >
            REENTREGAS NO FILTRO
          </Text>

          <Text mt="7px" fontSize="23px" fontWeight="700">
            {loading ? "—" : total}
          </Text>
        </Box>

        <Box
          bg={COLORS.card}
          border="1px solid"
          borderColor={COLORS.border}
          borderRadius="6px"
          px="16px"
          py="14px"
        >
          <Text
            fontSize="9px"
            color={COLORS.secondary}
            fontWeight="700"
            letterSpacing=".08em"
          >
            PENDENTES
          </Text>

          <Text mt="7px" fontSize="23px" fontWeight="700" color={COLORS.green}>
            {loading ? "—" : totalPendentes}
          </Text>
        </Box>

        <Box
          bg={COLORS.card}
          border="1px solid"
          borderColor={COLORS.border}
          borderRadius="6px"
          px="16px"
          py="14px"
        >
          <Text
            fontSize="9px"
            color={COLORS.secondary}
            fontWeight="700"
            letterSpacing=".08em"
          >
            FINALIZADAS
          </Text>

          <Text mt="7px" fontSize="23px" fontWeight="700" color={COLORS.blue}>
            {loading ? "—" : totalFinalizadas}
          </Text>
        </Box>
      </Box>

      {/* FILTROS */}

      <Box
        bg={COLORS.card}
        border="1px solid"
        borderColor={COLORS.border}
        borderRadius="6px"
        p={{
          base: "14px",
          lg: "16px",
        }}
        mb="14px"
      >
        <Flex
          align={{
            base: "flex-start",
            md: "center",
          }}
          justify="space-between"
          gap="12px"
          mb="12px"
        >
          <HStack gap="7px">
            <Filter size={14} color={COLORS.blue} />

            <Text fontSize="11px" fontWeight="700" letterSpacing=".06em">
              FILTROS
            </Text>
          </HStack>

          <Button
            variant="ghost"
            h="28px"
            px="8px"
            fontSize="10px"
            color={COLORS.secondary}
            onClick={limparFiltros}
            _hover={{
              bg: COLORS.cardHover,
              color: COLORS.text,
            }}
          >
            Limpar filtros
          </Button>
        </Flex>

        <Box
          display="grid"
          gridTemplateColumns={{
            base: "1fr",
            md: "180px repeat(3, 1fr)",
            xl: "180px repeat(5, 1fr)",
          }}
          gap="9px"
        >
          {/* PRESET */}

          <Box>
            <Text
              fontSize="8px"
              color={COLORS.muted}
              fontWeight="700"
              mb="5px"
              letterSpacing=".05em"
            >
              PERÍODO
            </Text>

            <select
              value={periodo}
              onChange={(e) => aplicarPeriodo(e.target.value as PeriodoPreset)}
              style={{
                width: "100%",
                height: "34px",
                borderRadius: "6px",
                border: `1px solid ${COLORS.borderHover}`,
                background: COLORS.bg,
                color: COLORS.text,
                padding: "0 9px",
                fontSize: "11px",
                outline: "none",
              }}
            >
              <option value="mes">Este mês</option>
              <option value="hoje">Hoje</option>
              <option value="ontem">Ontem</option>
              <option value="7">Últimos 7 dias</option>
              <option value="30">Últimos 30 dias</option>
              <option value="todos">Todos os períodos</option>
              <option value="personalizado">Personalizado</option>
            </select>
          </Box>

          {/* DATA INICIAL */}

          <Box>
            <Text
              fontSize="8px"
              color={COLORS.muted}
              fontWeight="700"
              mb="5px"
              letterSpacing=".05em"
            >
              DATA INICIAL
            </Text>

            <Input
              type="date"
              value={dataInicial}
              onChange={(e) => alterarDataInicial(e.target.value)}
              h="34px"
              bg={COLORS.bg}
              borderColor={COLORS.borderHover}
              color={COLORS.text}
              fontSize="11px"
              disabled={periodo === "todos"}
              _focus={{
                borderColor: COLORS.blue,
                boxShadow: `0 0 0 1px ${COLORS.blue}`,
              }}
            />
          </Box>

          {/* DATA FINAL */}

          <Box>
            <Text
              fontSize="8px"
              color={COLORS.muted}
              fontWeight="700"
              mb="5px"
              letterSpacing=".05em"
            >
              DATA FINAL
            </Text>

            <Input
              type="date"
              value={dataFinal}
              onChange={(e) => alterarDataFinal(e.target.value)}
              h="34px"
              bg={COLORS.bg}
              borderColor={COLORS.borderHover}
              color={COLORS.text}
              fontSize="11px"
              disabled={periodo === "todos"}
              _focus={{
                borderColor: COLORS.blue,
                boxShadow: `0 0 0 1px ${COLORS.blue}`,
              }}
            />
          </Box>

          {/* STATUS */}

          <Box>
            <Text
              fontSize="8px"
              color={COLORS.muted}
              fontWeight="700"
              mb="5px"
              letterSpacing=".05em"
            >
              STATUS
            </Text>

            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as StatusFiltro)}
              style={{
                width: "100%",
                height: "34px",
                borderRadius: "6px",
                border: `1px solid ${COLORS.borderHover}`,
                background: COLORS.bg,
                color: COLORS.text,
                padding: "0 9px",
                fontSize: "11px",
                outline: "none",
              }}
            >
              <option value="todos">Todos</option>
              <option value="pendente">Pendentes</option>
              <option value="finalizado">Finalizadas</option>
            </select>
          </Box>

          {/* VEÍCULO */}

          <Box>
            <Text
              fontSize="8px"
              color={COLORS.muted}
              fontWeight="700"
              mb="5px"
              letterSpacing=".05em"
            >
              VEÍCULO
            </Text>

            <select
              value={veiculoFiltro}
              onChange={(e) => setVeiculoFiltro(e.target.value)}
              style={{
                width: "100%",
                height: "34px",
                borderRadius: "6px",
                border: `1px solid ${COLORS.borderHover}`,
                background: COLORS.bg,
                color: COLORS.text,
                padding: "0 9px",
                fontSize: "11px",
                outline: "none",
              }}
            >
              <option value="todos">Todos os veículos</option>
              <option value="sem_veiculo">A definir</option>
              {veiculos.map((veiculo) => (
                <option key={veiculo.id} value={veiculo.id}>
                  {veiculo.placa}
                </option>
              ))}
            </select>
          </Box>

          {/* PROGRAMAÇÃO */}

          <Box>
            <Text
              fontSize="8px"
              color={COLORS.muted}
              fontWeight="700"
              mb="5px"
              letterSpacing=".05em"
            >
              PROGRAMAÇÃO
            </Text>

            <select
              value={programacao}
              onChange={(e) =>
                setProgramacao(e.target.value as ProgramacaoFiltro)
              }
              style={{
                width: "100%",
                height: "34px",
                borderRadius: "6px",
                border: `1px solid ${COLORS.borderHover}`,
                background: COLORS.bg,
                color: COLORS.text,
                padding: "0 9px",
                fontSize: "11px",
                outline: "none",
              }}
            >
              <option value="todos">Todas</option>
              <option value="a_definir">A definir</option>
              <option value="programada">Programadas</option>
              <option value="nao_vai">Não vai</option>
            </select>
          </Box>
        </Box>

        {/* BUSCA */}

        <Box mt="10px">
          <Text
            fontSize="8px"
            color={COLORS.muted}
            fontWeight="700"
            mb="5px"
            letterSpacing=".05em"
          >
            BUSCAR
          </Text>

          <Box position="relative">
            <Box
              position="absolute"
              left="10px"
              top="50%"
              transform="translateY(-50%)"
              color={COLORS.muted}
              pointerEvents="none"
              zIndex={1}
            >
              <Search size={13} />
            </Box>

            <Input
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="NF, cliente, vendedor, motorista, cidade ou observação..."
              pl="31px"
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
                boxShadow: `0 0 0 1px ${COLORS.blue}`,
              }}
            />
          </Box>
        </Box>
      </Box>

      {/* LISTA */}

      <Box
        bg={COLORS.card}
        border="1px solid"
        borderColor={COLORS.border}
        borderRadius="6px"
        overflow="hidden"
      >
        <Box
          px={{
            base: "14px",
            lg: "18px",
          }}
          py="13px"
          borderBottom="1px solid"
          borderColor={COLORS.border}
        >
          <Flex
            justify="space-between"
            align={{
              base: "flex-start",
              md: "center",
            }}
            direction={{
              base: "column",
              md: "row",
            }}
            gap="8px"
          >
            <Box>
              <Text fontSize="13px" fontWeight="650">
                Ocorrências de reentrega
              </Text>

              <Text fontSize="10px" color={COLORS.muted} mt="2px">
                {reentregasFiltradas.length}{" "}
                {reentregasFiltradas.length === 1
                  ? "registro encontrado"
                  : "registros encontrados"}
              </Text>
            </Box>

            <HStack gap="8px">
              {(busca ||
                status !== "todos" ||
                periodo !== "mes" ||
                programacao !== "todos" ||
                veiculoFiltro !== "todos") && (
                <Badge
                  bg={COLORS.blueSoft}
                  color={COLORS.blue}
                  borderRadius="4px"
                  px="7px"
                  py="4px"
                  fontSize="8px"
                >
                  FILTROS ATIVOS
                </Badge>
              )}

              <Button
                h="28px"
                px="9px"
                fontSize="10px"
                variant="outline"
                borderColor={COLORS.borderHover}
                color={COLORS.secondary}
                onClick={(e) => {
                  e.stopPropagation();
                  setNovaPlaca("");
                  setModalVeiculoAberto(true);
                }}
                _hover={{ bg: COLORS.cardHover, color: COLORS.text }}
              >
                <Plus size={12} />
                Adicionar veículo
              </Button>
            </HStack>
          </Flex>
        </Box>

        {/* LOADING */}

        {loading && (
          <Box px="18px" py="35px">
            <Text textAlign="center" fontSize="12px" color={COLORS.secondary}>
              Carregando reentregas...
            </Text>
          </Box>
        )}

        {/* VAZIO */}

        {!loading && reentregasFiltradas.length === 0 && (
          <Box px="20px" py="55px" textAlign="center">
            <Flex
              mx="auto"
              mb="12px"
              w="38px"
              h="38px"
              align="center"
              justify="center"
              borderRadius="8px"
              bg={COLORS.greenSoft}
              color={COLORS.green}
            >
              <PackageCheck size={18} />
            </Flex>

            <Text fontSize="13px" fontWeight="600">
              Nenhuma reentrega encontrada
            </Text>

            <Text fontSize="11px" color={COLORS.muted} mt="4px">
              Tente alterar o período, status ou termos da busca.
            </Text>
          </Box>
        )}

        {/* TABELA */}

        {!loading && reentregasFiltradas.length > 0 && (
          <Box overflowX="auto">
            <Box minW="900px">
              <Box
                display="grid"
                gridTemplateColumns="130px minmax(220px, 1fr) 160px 120px 220px 130px 40px"
                gap="12px"
                px="18px"
                py="8px"
                bg="#171A21"
                borderBottom="1px solid"
                borderColor={COLORS.border}
                color={COLORS.secondary}
                fontSize="8px"
                fontWeight="700"
                letterSpacing=".06em"
              >
                <Text>NF</Text>
                <Text>CLIENTE</Text>
                <Text>VENDEDOR</Text>
                <Text>DATA</Text>
                <Text>VEÍCULO / PROGRAMAÇÃO</Text>
                <Text>STATUS</Text>
                <Text />
              </Box>

              {reentregasFiltradas.map((ocorrencia) => {
                const pendente = getStatus(ocorrencia) === "pendente";

                return (
                  <Box
                    key={ocorrencia.id}
                    display="grid"
                    gridTemplateColumns="130px minmax(220px, 1fr) 160px 120px 220px 130px 40px"
                    gap="12px"
                    alignItems="center"
                    px="18px"
                    py="12px"
                    borderBottom="1px solid"
                    borderColor={COLORS.border}
                    cursor="pointer"
                    transition="background .15s ease"
                    _hover={{
                      bg: COLORS.cardHover,
                    }}
                    onClick={() => setSelecionada(ocorrencia)}
                  >
                    <Box>
                      <Text fontSize="12px" fontWeight="700">
                        {ocorrencia.numeroNfOriginal ||
                          ocorrencia.numeroNf ||
                          "—"}
                      </Text>

                      {ocorrencia.numeroNf &&
                        ocorrencia.numeroNfOriginal &&
                        ocorrencia.numeroNf !== ocorrencia.numeroNfOriginal && (
                          <Text fontSize="8px" color={COLORS.muted} mt="2px">
                            #{ocorrencia.numeroNf}
                          </Text>
                        )}
                    </Box>

                    <Box>
                      <Text fontSize="11px" fontWeight="600">
                        {ocorrencia.cliente || "Cliente não informado"}
                      </Text>

                      {ocorrencia.cidade && (
                        <Text fontSize="9px" color={COLORS.muted} mt="2px">
                          {ocorrencia.cidade}
                        </Text>
                      )}
                    </Box>

                    <Text fontSize="11px" color={COLORS.secondary}>
                      {ocorrencia.vendedor || "—"}
                    </Text>

                    <Text fontSize="10px" color={COLORS.secondary}>
                      {formatDate(getOccurrenceDate(ocorrencia))}
                    </Text>

                    <Box onClick={(e) => e.stopPropagation()}>
                      <select
                        value={
                          getProgramacaoStatus(ocorrencia) === "nao_vai"
                            ? "nao_vai"
                            : ocorrencia.veiculoReentregaId || ""
                        }
                        disabled={salvandoReentregaId === ocorrencia.id}
                        onChange={(e) =>
                          atualizarProgramacao(ocorrencia, e.target.value)
                        }
                        style={{
                          width: "100%",
                          height: "34px",
                          borderRadius: "5px",
                          border: `1px solid ${COLORS.borderHover}`,
                          background: COLORS.bg,
                          color: COLORS.text,
                          padding: "0 8px",
                          fontSize: "10px",
                          outline: "none",
                          opacity:
                            salvandoReentregaId === ocorrencia.id ? 0.6 : 1,
                        }}
                      >
                        <option value="">A DEFINIR</option>
                        {veiculos.map((veiculo) => (
                          <option key={veiculo.id} value={veiculo.id}>
                            {veiculo.placa}
                          </option>
                        ))}
                        <option value="nao_vai">NÃO VAI</option>
                      </select>
                      <Text
                        mt="4px"
                        fontSize="8px"
                        fontWeight="700"
                        color={
                          getProgramacaoStatus(ocorrencia) === "programada"
                            ? COLORS.blue
                            : getProgramacaoStatus(ocorrencia) === "nao_vai"
                              ? COLORS.danger
                              : COLORS.muted
                        }
                      >
                        {getProgramacaoLabel(ocorrencia)}
                      </Text>
                    </Box>

                    <Badge
                      w="fit-content"
                      bg={pendente ? COLORS.greenSoft : COLORS.blueSoft}
                      color={pendente ? COLORS.green : COLORS.blue}
                      borderRadius="4px"
                      px="7px"
                      py="4px"
                      fontSize="8px"
                      fontWeight="700"
                    >
                      {pendente ? "PENDENTE" : "FINALIZADA"}
                    </Badge>

                    <Flex align="center" justify="center" color={COLORS.muted}>
                      <ChevronRight size={15} />
                    </Flex>
                  </Box>
                );
              })}
            </Box>
          </Box>
        )}
      </Box>

      {/* MODAL CADASTRO DE VEÍCULO */}

      {modalVeiculoAberto && (
        <Box
          position="fixed"
          inset="0"
          zIndex={1100}
          bg="rgba(0,0,0,.72)"
          display="flex"
          alignItems="center"
          justifyContent="center"
          p="18px"
          onClick={() => setModalVeiculoAberto(false)}
        >
          <Box
            w="100%"
            maxW="420px"
            bg={COLORS.card}
            border="1px solid"
            borderColor={COLORS.borderHover}
            borderRadius="10px"
            onClick={(e) => e.stopPropagation()}
          >
            <Flex
              px="18px"
              py="14px"
              align="center"
              justify="space-between"
              borderBottom="1px solid"
              borderColor={COLORS.border}
            >
              <Box>
                <HStack gap="8px">
                  <Truck size={16} color={COLORS.blue} />
                  <Heading fontSize="15px" fontWeight="650">
                    Adicionar veículo
                  </Heading>
                </HStack>
                <Text fontSize="10px" color={COLORS.secondary} mt="3px">
                  Cadastre uma placa para programar as reentregas.
                </Text>
              </Box>
              <Button
                variant="ghost"
                minW="32px"
                w="32px"
                h="32px"
                p="0"
                color={COLORS.secondary}
                onClick={() => setModalVeiculoAberto(false)}
              >
                <X size={17} />
              </Button>
            </Flex>

            <Box p="18px">
              <Text
                fontSize="8px"
                color={COLORS.muted}
                fontWeight="700"
                mb="6px"
                letterSpacing=".05em"
              >
                PLACA
              </Text>
              <Input
                value={novaPlaca}
                onChange={(e) => setNovaPlaca(e.target.value.toUpperCase())}
                placeholder="ABC1D23"
                h="38px"
                bg={COLORS.bg}
                borderColor={COLORS.borderHover}
                color={COLORS.text}
                fontSize="12px"
                textTransform="uppercase"
                maxLength={8}
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter") cadastrarVeiculo();
                }}
                _focus={{
                  borderColor: COLORS.blue,
                  boxShadow: `0 0 0 1px ${COLORS.blue}`,
                }}
              />
            </Box>

            <Flex
              px="18px"
              py="12px"
              justify="flex-end"
              gap="8px"
              borderTop="1px solid"
              borderColor={COLORS.border}
            >
              <Button
                variant="ghost"
                h="34px"
                px="12px"
                fontSize="10px"
                color={COLORS.secondary}
                onClick={() => setModalVeiculoAberto(false)}
              >
                Cancelar
              </Button>
              <Button
                h="34px"
                px="14px"
                fontSize="10px"
                bg={COLORS.blue}
                color="white"
                loading={salvandoVeiculo}
                onClick={cadastrarVeiculo}
                _hover={{ bg: COLORS.blueHover }}
              >
                <Plus size={13} />
                Cadastrar veículo
              </Button>
            </Flex>
          </Box>
        </Box>
      )}

      {/* MODAL */}

      {selecionada && (
        <Box
          position="fixed"
          inset="0"
          zIndex={1000}
          bg="rgba(0,0,0,.72)"
          display="flex"
          alignItems="center"
          justifyContent="center"
          p={{
            base: "10px",
            md: "20px",
          }}
          onClick={() => setSelecionada(null)}
        >
          <Box
            w="100%"
            maxW="720px"
            maxH="90vh"
            overflow="hidden"
            display="flex"
            flexDirection="column"
            bg={COLORS.card}
            border="1px solid"
            borderColor={COLORS.borderHover}
            borderRadius="10px"
            boxShadow="0 24px 80px rgba(0,0,0,.45)"
            onClick={(e) => e.stopPropagation()}
          >
            {/* HEADER */}

            <Flex
              px="18px"
              py="14px"
              align="center"
              justify="space-between"
              borderBottom="1px solid"
              borderColor={COLORS.border}
            >
              <Box>
                <HStack gap="8px">
                  <RefreshCw size={16} color={COLORS.green} />

                  <Heading fontSize="16px" fontWeight="650">
                    Reentrega — NF{" "}
                    {selecionada.numeroNfOriginal ||
                      selecionada.numeroNf ||
                      "—"}
                  </Heading>
                </HStack>

                <Text fontSize="10px" color={COLORS.secondary} mt="3px">
                  Detalhes da ocorrência de reentrega
                </Text>
              </Box>

              <Button
                variant="ghost"
                minW="32px"
                w="32px"
                h="32px"
                p="0"
                color={COLORS.secondary}
                onClick={() => setSelecionada(null)}
                _hover={{
                  bg: "rgba(255,255,255,.05)",
                  color: COLORS.text,
                }}
              >
                <X size={17} />
              </Button>
            </Flex>

            {/* CONTENT */}

            <Box
              overflowY="auto"
              p="18px"
              css={{
                "&::-webkit-scrollbar": {
                  width: "6px",
                },
                "&::-webkit-scrollbar-thumb": {
                  background: "#303641",
                  borderRadius: "6px",
                },
              }}
            >
              <Box
                display="grid"
                gridTemplateColumns={{
                  base: "1fr",
                  md: "1fr 1fr",
                }}
                gap="10px"
              >
                <Box
                  p="12px"
                  bg={COLORS.bg}
                  border="1px solid"
                  borderColor={COLORS.border}
                  borderRadius="6px"
                >
                  <HStack gap="7px">
                    <User size={13} color={COLORS.muted} />

                    <Text fontSize="8px" color={COLORS.muted} fontWeight="700">
                      CLIENTE
                    </Text>
                  </HStack>

                  <Text fontSize="12px" fontWeight="600" mt="7px">
                    {selecionada.cliente || "Não informado"}
                  </Text>
                </Box>

                <Box
                  p="12px"
                  bg={COLORS.bg}
                  border="1px solid"
                  borderColor={COLORS.border}
                  borderRadius="6px"
                >
                  <Text fontSize="8px" color={COLORS.muted} fontWeight="700">
                    VENDEDOR
                  </Text>

                  <Text fontSize="12px" fontWeight="600" mt="7px">
                    {selecionada.vendedor || "—"}
                  </Text>
                </Box>

                <Box
                  p="12px"
                  bg={COLORS.bg}
                  border="1px solid"
                  borderColor={COLORS.border}
                  borderRadius="6px"
                >
                  <HStack gap="7px">
                    <CalendarDays size={13} color={COLORS.muted} />

                    <Text fontSize="8px" color={COLORS.muted} fontWeight="700">
                      REGISTRADA EM
                    </Text>
                  </HStack>

                  <Text fontSize="12px" fontWeight="600" mt="7px">
                    {formatDateTime(getOccurrenceDate(selecionada))}
                  </Text>
                </Box>

                <Box
                  p="12px"
                  bg={COLORS.bg}
                  border="1px solid"
                  borderColor={COLORS.border}
                  borderRadius="6px"
                >
                  <Text fontSize="8px" color={COLORS.muted} fontWeight="700">
                    STATUS
                  </Text>

                  <Badge
                    mt="7px"
                    bg={
                      getStatus(selecionada) === "pendente"
                        ? COLORS.greenSoft
                        : COLORS.blueSoft
                    }
                    color={
                      getStatus(selecionada) === "pendente"
                        ? COLORS.green
                        : COLORS.blue
                    }
                    borderRadius="4px"
                    px="7px"
                    py="4px"
                    fontSize="8px"
                    fontWeight="700"
                  >
                    {getStatus(selecionada) === "pendente"
                      ? "PENDENTE"
                      : "FINALIZADA"}
                  </Badge>
                </Box>

                {selecionada.motorista && (
                  <Box
                    p="12px"
                    bg={COLORS.bg}
                    border="1px solid"
                    borderColor={COLORS.border}
                    borderRadius="6px"
                  >
                    <Text fontSize="8px" color={COLORS.muted} fontWeight="700">
                      MOTORISTA
                    </Text>

                    <Text fontSize="12px" fontWeight="600" mt="7px">
                      {selecionada.motorista}
                    </Text>
                  </Box>
                )}

                {selecionada.cidade && (
                  <Box
                    p="12px"
                    bg={COLORS.bg}
                    border="1px solid"
                    borderColor={COLORS.border}
                    borderRadius="6px"
                  >
                    <Text fontSize="8px" color={COLORS.muted} fontWeight="700">
                      CIDADE
                    </Text>

                    <Text fontSize="12px" fontWeight="600" mt="7px">
                      {selecionada.cidade}
                    </Text>
                  </Box>
                )}
              </Box>

              {/* PROGRAMAÇÃO */}

              <Box mt="12px">
                <HStack gap="7px" mb="5px">
                  <Truck size={13} color={COLORS.blue} />
                  <Text
                    fontSize="9px"
                    color={COLORS.secondary}
                    fontWeight="700"
                    letterSpacing=".06em"
                  >
                    PROGRAMAÇÃO DA REENTREGA
                  </Text>
                </HStack>

                <Box
                  p="12px"
                  bg={COLORS.bg}
                  border="1px solid"
                  borderColor={COLORS.border}
                  borderRadius="6px"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Text
                    fontSize="8px"
                    color={COLORS.muted}
                    fontWeight="700"
                    mb="6px"
                  >
                    VEÍCULO
                  </Text>
                  <select
                    value={
                      getProgramacaoStatus(selecionada) === "nao_vai"
                        ? "nao_vai"
                        : selecionada.veiculoReentregaId || ""
                    }
                    disabled={salvandoReentregaId === selecionada.id}
                    onChange={(e) =>
                      atualizarProgramacao(selecionada, e.target.value)
                    }
                    style={{
                      width: "100%",
                      height: "36px",
                      borderRadius: "6px",
                      border: `1px solid ${COLORS.borderHover}`,
                      background: COLORS.card,
                      color: COLORS.text,
                      padding: "0 9px",
                      fontSize: "11px",
                      outline: "none",
                    }}
                  >
                    <option value="">A DEFINIR</option>
                    {veiculos.map((veiculo) => (
                      <option key={veiculo.id} value={veiculo.id}>
                        {veiculo.placa}
                      </option>
                    ))}
                    <option value="nao_vai">NÃO VAI</option>
                  </select>
                </Box>
              </Box>

              {/* OBSERVAÇÃO */}

              <Box mt="12px">
                <HStack gap="7px" mb="5px">
                  <AlertCircle size={13} color={COLORS.green} />

                  <Text
                    fontSize="9px"
                    color={COLORS.secondary}
                    fontWeight="700"
                    letterSpacing=".06em"
                  >
                    OBSERVAÇÃO DA REENTREGA
                  </Text>
                </HStack>

                <Box
                  px="13px"
                  py="12px"
                  bg={COLORS.greenSoft}
                  border="1px solid"
                  borderColor="rgba(52,211,153,.18)"
                  borderRadius="6px"
                >
                  <Text fontSize="11px" color={COLORS.text} lineHeight="1.6">
                    {selecionada.observacao || "Nenhuma observação registrada."}
                  </Text>
                </Box>
              </Box>
            </Box>

            {/* FOOTER */}

            <Flex
              px="18px"
              py="11px"
              justify="flex-end"
              borderTop="1px solid"
              borderColor={COLORS.border}
            >
              <Button
                variant="outline"
                borderColor={COLORS.borderHover}
                color={COLORS.text}
                h="34px"
                px="15px"
                fontSize="11px"
                onClick={() => setSelecionada(null)}
                _hover={{
                  bg: COLORS.cardHover,
                }}
              >
                Fechar
              </Button>
            </Flex>
          </Box>
        </Box>
      )}
    </Box>
  );
}
