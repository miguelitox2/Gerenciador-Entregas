import { useEffect, useState } from "react";
import {
  Badge,
  Box,
  Button,
  Card,
  Flex,
  Heading,
  HStack,
  Input,
  Spinner,
  Table,
  Text,
} from "@chakra-ui/react";
import { API_URL } from "../config/api";

/* =========================================================
   TIPOS
========================================================= */

interface NotaItem {
  id: string;
  codigo: string;
  descricao: string;
  quantidade: number;
  valorTotal: number;
}

interface Nota {
  numeroNf: string;
  numeroNfOriginal: string;
  placa?: string;
  peso?: number;
  valor?: number;
  cliente?: string;
  cidade?: string;
  motorista?: string;
  importadoEm: string;
  itens?: NotaItem[];
}

/* =========================================================
   CORES DO SISTEMA
========================================================= */

const COLORS = {
  background: "#0F1115",

  card: "#111318",
  cardHover: "#1A1D24",

  border: "#252932",
  borderHover: "#353B47",

  text: "#F1F5F9",
  textSecondary: "#9CA3AF",
  textMuted: "#6B7280",

  blue: "#3B82F6",
  blueHover: "#2563EB",
  blueSoft: "rgba(59, 130, 246, 0.12)",

  input: "#0F1115",
  inputBorder: "#353B47",

  statusBackground: "rgba(59, 130, 246, 0.12)",
  statusText: "#60A5FA",
};

/* =========================================================
   COMPONENTE
========================================================= */

export function Buscar() {
  const [termo, setTermo] = useState("");
  const [notas, setNotas] = useState<Nota[]>([]);
  const [loading, setLoading] = useState(true);

  /* =======================================================
     CARREGAR NOTAS
  ======================================================= */

  useEffect(() => {
    async function carregarNotas() {
      try {
        setLoading(true);

        const response = await fetch(`${API_URL}/api/notas`);

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Não foi possível carregar as notas.");
        }

        setNotas(data.notas || []);
      } catch (error) {
        console.error("Erro ao buscar notas fiscais:", error);
      } finally {
        setLoading(false);
      }
    }

    carregarNotas();
  }, []);

  /* =======================================================
     FILTRO
  ======================================================= */

  const termoBusca = termo.trim().toLowerCase();

  const notasFiltradas = notas.filter((nota) => {
    const numeroNf = nota.numeroNf?.toLowerCase() || "";

    const cliente = nota.cliente?.toLowerCase() || "";

    const cidade = nota.cidade?.toLowerCase() || "";

    return (
      numeroNf.includes(termoBusca) ||
      cliente.includes(termoBusca) ||
      cidade.includes(termoBusca)
    );
  });

  /* =======================================================
     FORMATAÇÕES
  ======================================================= */

  function formatarData(data: string) {
    return new Date(data).toLocaleDateString("pt-BR");
  }

  function formatarValor(valor?: number) {
    return Number(valor || 0).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <Box
      minH="100%"
      p={{ base: "20px", lg: "32px" }}
      maxW="1400px"
      mx="auto"
      bg={COLORS.background}
    >
      {/* ===================================================
          CABEÇALHO
      =================================================== */}

      <Box mb="24px">
        <Heading
          fontSize="22px"
          fontWeight="600"
          color={COLORS.text}
          letterSpacing="-0.02em"
        >
          Busca de Notas Fiscais
        </Heading>

        <Text fontSize="13.5px" color={COLORS.textSecondary} mt="2px">
          Consulte o status das entregas e notas importadas diretamente do banco
          de dados.
        </Text>
      </Box>

      {/* ===================================================
          CAMPO DE PESQUISA
      =================================================== */}

      <Card.Root
        mb="24px"
        p="16px"
        borderRadius="10px"
        borderWidth="1px"
        borderColor={COLORS.border}
        bg={COLORS.card}
        boxShadow="none"
      >
        <Flex gap="12px" wrap="wrap">
          <Input
            placeholder="Pesquisar por número da NF, cliente ou cidade..."
            value={termo}
            onChange={(event) => setTermo(event.target.value)}
            maxW="480px"
            h="42px"
            fontSize="13.5px"
            color={COLORS.text}
            bg={COLORS.input}
            borderColor={COLORS.inputBorder}
            _placeholder={{
              color: COLORS.textMuted,
            }}
            _hover={{
              borderColor: COLORS.borderHover,
            }}
            _focus={{
              borderColor: COLORS.blue,
              boxShadow: `0 0 0 3px ${COLORS.blueSoft}`,
            }}
          />

          <Button
            h="42px"
            px="20px"
            bg={COLORS.blue}
            color="white"
            fontWeight="600"
            fontSize="13.5px"
            _hover={{
              bg: COLORS.blueHover,
            }}
          >
            Pesquisar
          </Button>
        </Flex>
      </Card.Root>

      {/* ===================================================
          TABELA
      =================================================== */}

      <Card.Root
        borderRadius="10px"
        borderWidth="1px"
        borderColor={COLORS.border}
        bg={COLORS.card}
        overflow="hidden"
        boxShadow="none"
      >
        <Box overflowX="auto" bg={COLORS.card}>
          <Table.Root
            size="sm"
            variant="line"
            bg={COLORS.card}
            color={COLORS.text}
            css={{
              "& thead": {
                backgroundColor: COLORS.cardHover,
              },

              "& tbody": {
                backgroundColor: COLORS.card,
              },

              "& tr": {
                backgroundColor: COLORS.card,
              },

              "& th": {
                backgroundColor: COLORS.cardHover,
                color: COLORS.textSecondary,
                borderColor: COLORS.border,
              },

              "& td": {
                backgroundColor: COLORS.card,
                color: COLORS.text,
                borderColor: COLORS.border,
              },

              "& tbody tr:hover": {
                backgroundColor: COLORS.cardHover,
              },

              "& tbody tr:hover td": {
                backgroundColor: COLORS.cardHover,
              },
            }}
          >
            {/* =================================================
                CABEÇALHO DA TABELA
            ================================================= */}

            <Table.Header>
              <Table.Row>
                <Table.ColumnHeader
                  fontWeight="700"
                  fontSize="11px"
                  textTransform="uppercase"
                >
                  NF
                </Table.ColumnHeader>

                <Table.ColumnHeader
                  fontWeight="700"
                  fontSize="11px"
                  textTransform="uppercase"
                >
                  Cliente / Destino
                </Table.ColumnHeader>

                <Table.ColumnHeader
                  fontWeight="700"
                  fontSize="11px"
                  textTransform="uppercase"
                >
                  Data Importação
                </Table.ColumnHeader>

                <Table.ColumnHeader
                  fontWeight="700"
                  fontSize="11px"
                  textTransform="uppercase"
                  textAlign="right"
                >
                  Valor
                </Table.ColumnHeader>

                <Table.ColumnHeader
                  fontWeight="700"
                  fontSize="11px"
                  textTransform="uppercase"
                  textAlign="center"
                >
                  Status
                </Table.ColumnHeader>

                <Table.ColumnHeader
                  fontWeight="700"
                  fontSize="11px"
                  textTransform="uppercase"
                  textAlign="right"
                >
                  Ações
                </Table.ColumnHeader>
              </Table.Row>
            </Table.Header>

            {/* =================================================
                CORPO DA TABELA
            ================================================= */}

            <Table.Body>
              {/* Loading */}

              {loading ? (
                <Table.Row>
                  <Table.Cell colSpan={6} textAlign="center" py="40px">
                    <Flex direction="column" align="center" gap="8px">
                      <Spinner size="md" color={COLORS.blue} />

                      <Text fontSize="13px" color={COLORS.textSecondary}>
                        Carregando notas do sistema...
                      </Text>
                    </Flex>
                  </Table.Cell>
                </Table.Row>
              ) : notasFiltradas.length > 0 ? (
                notasFiltradas.map((item) => {
                  const dataFormatada = formatarData(item.importadoEm);

                  const valorFormatado = formatarValor(item.valor);

                  return (
                    <Table.Row key={item.numeroNf}>
                      {/* NF */}

                      <Table.Cell
                        fontVariantNumeric="tabular-nums"
                        fontWeight="600"
                        color={COLORS.blue}
                      >
                        #{item.numeroNf}
                      </Table.Cell>

                      {/* Cliente / Destino */}

                      <Table.Cell>
                        <Text
                          fontWeight="600"
                          color={COLORS.text}
                          fontSize="13.5px"
                        >
                          {item.cliente || "Cliente não informado"}
                        </Text>

                        <Text fontSize="12px" color={COLORS.textMuted}>
                          {item.cidade || "Cidade não informada"}
                        </Text>
                      </Table.Cell>

                      {/* Data */}

                      <Table.Cell
                        fontVariantNumeric="tabular-nums"
                        color={COLORS.textSecondary}
                        fontSize="13px"
                      >
                        {dataFormatada}
                      </Table.Cell>

                      {/* Valor */}

                      <Table.Cell
                        fontVariantNumeric="tabular-nums"
                        fontWeight="600"
                        textAlign="right"
                        color={COLORS.text}
                        fontSize="13px"
                      >
                        {valorFormatado}
                      </Table.Cell>

                      {/* Status */}

                      <Table.Cell textAlign="center">
                        <Badge
                          px="8px"
                          py="3px"
                          borderRadius="full"
                          fontSize="11px"
                          fontWeight="600"
                          bg={COLORS.statusBackground}
                          color={COLORS.statusText}
                        >
                          Ativa
                        </Badge>
                      </Table.Cell>

                      {/* Ações */}

                      <Table.Cell textAlign="right">
                        <HStack justify="flex-end" gap="8px">
                          <Button
                            size="xs"
                            variant="outline"
                            borderColor={COLORS.borderHover}
                            color={COLORS.textSecondary}
                            _hover={{
                              bg: COLORS.cardHover,
                              borderColor: "#4B5563",
                              color: COLORS.text,
                            }}
                          >
                            Ver detalhes
                          </Button>
                        </HStack>
                      </Table.Cell>
                    </Table.Row>
                  );
                })
              ) : (
                /* Nenhum resultado */

                <Table.Row>
                  <Table.Cell colSpan={6} textAlign="center" py="40px">
                    <Text color={COLORS.textMuted} fontSize="13px">
                      Nenhuma nota fiscal encontrada no banco de dados.
                    </Text>
                  </Table.Cell>
                </Table.Row>
              )}
            </Table.Body>
          </Table.Root>
        </Box>
      </Card.Root>
    </Box>
  );
}
