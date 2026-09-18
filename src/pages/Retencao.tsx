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
  SimpleGrid,
  Spinner,
  Table,
  Text,
} from "@chakra-ui/react";

import { Search, Truck } from "lucide-react";

import { API_URL } from "../config/api";

/* =========================================================
   TIPOS
========================================================= */

interface RetencaoItem {
  id: string;
  placa: string;
  motoristas?: string[];
  vendedores?: string[];
  motivo?: string;
  quantidadeNfs: number;
  totalValor: number;
  criadoEm: string;
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

  warning: "#FBBF24",
  warningSoft: "rgba(245, 158, 11, 0.12)",

  danger: "#F87171",
  dangerSoft: "rgba(239, 68, 68, 0.12)",

  input: "#0F1115",
  inputBorder: "#353B47",
};

/* =========================================================
   COMPONENTE
========================================================= */

export function Retencao() {
  const [termo, setTermo] = useState("");

  const [retencoes, setRetencoes] = useState<RetencaoItem[]>([]);

  const [loading, setLoading] = useState(true);

  /* =======================================================
     CARREGAR RETENÇÕES
  ======================================================= */

  useEffect(() => {
    async function carregarRetencoes() {
      try {
        setLoading(true);

        const response = await fetch(`${API_URL}/api/retencoes`);

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.error || "Não foi possível carregar as retenções.",
          );
        }

        setRetencoes(data.retencoes || []);
      } catch (error) {
        console.error("Erro ao buscar retenções:", error);
      } finally {
        setLoading(false);
      }
    }

    carregarRetencoes();
  }, []);

  /* =======================================================
     FILTRO
  ======================================================= */

  const termoBusca = termo.trim().toLowerCase();

  const retencoesFiltradas = retencoes.filter((item) => {
    const placa = item.placa?.toLowerCase() || "";

    const motivo = item.motivo?.toLowerCase() || "";

    return placa.includes(termoBusca) || motivo.includes(termoBusca);
  });

  /* =======================================================
     MÉTRICAS
  ======================================================= */

  const totalVeiculos = retencoes.length;

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

      <Flex
        justify="space-between"
        align="center"
        mb="24px"
        wrap="wrap"
        gap="16px"
      >
        <Box>
          <Flex align="center" gap="10px">
            <Box
              w="36px"
              h="36px"
              display="flex"
              alignItems="center"
              justifyContent="center"
              borderRadius="9px"
              bg={COLORS.blueSoft}
              color={COLORS.blue}
            >
              <Truck size={20} strokeWidth={1.8} />
            </Box>

            <Heading
              fontSize="22px"
              fontWeight="600"
              color={COLORS.text}
              letterSpacing="-0.02em"
            >
              Retenção de Veículos
            </Heading>
          </Flex>

          <Text fontSize="13.5px" color={COLORS.textSecondary} mt="6px">
            Monitore veículos parados em clientes, postos fiscais ou centros de
            distribuição.
          </Text>
        </Box>

        <Button
          h="42px"
          px="16px"
          bg={COLORS.blue}
          color="white"
          fontSize="13.5px"
          fontWeight="600"
          borderRadius="8px"
          _hover={{
            bg: COLORS.blueHover,
          }}
        >
          + Registrar Retenção
        </Button>
      </Flex>

      {/* ===================================================
          MÉTRICAS
      =================================================== */}

      <SimpleGrid
        columns={{
          base: 1,
          sm: 2,
          lg: 3,
        }}
        gap="16px"
        mb="24px"
      >
        {/* Veículos retidos */}

        <Card.Root
          p="16px"
          borderRadius="10px"
          borderWidth="1px"
          borderColor={COLORS.border}
          bg={COLORS.card}
          boxShadow="none"
        >
          <Text
            fontSize="11px"
            fontWeight="700"
            letterSpacing="0.08em"
            textTransform="uppercase"
            color={COLORS.textSecondary}
            mb="4px"
          >
            Veículos Retidos Agora
          </Text>

          <Text
            fontSize="24px"
            fontWeight="600"
            color={COLORS.warning}
            fontVariantNumeric="tabular-nums"
          >
            {totalVeiculos} veículos
          </Text>
        </Card.Root>

        {/* Tempo médio */}

        <Card.Root
          p="16px"
          borderRadius="10px"
          borderWidth="1px"
          borderColor={COLORS.border}
          bg={COLORS.card}
          boxShadow="none"
        >
          <Text
            fontSize="11px"
            fontWeight="700"
            letterSpacing="0.08em"
            textTransform="uppercase"
            color={COLORS.textSecondary}
            mb="4px"
          >
            Tempo Médio de Retenção
          </Text>

          <Text
            fontSize="24px"
            fontWeight="600"
            color={COLORS.text}
            fontVariantNumeric="tabular-nums"
          >
            -
          </Text>
        </Card.Root>

        {/* Liberados */}

        <Card.Root
          p="16px"
          borderRadius="10px"
          borderWidth="1px"
          borderColor={COLORS.border}
          bg={COLORS.card}
          boxShadow="none"
        >
          <Text
            fontSize="11px"
            fontWeight="700"
            letterSpacing="0.08em"
            textTransform="uppercase"
            color={COLORS.textSecondary}
            mb="4px"
          >
            Liberados Hoje
          </Text>

          <Text
            fontSize="24px"
            fontWeight="600"
            color={COLORS.blue}
            fontVariantNumeric="tabular-nums"
          >
            0 veículos
          </Text>
        </Card.Root>
      </SimpleGrid>

      {/* ===================================================
          FILTRO
      =================================================== */}

      <Card.Root
        p="16px"
        mb="24px"
        borderRadius="10px"
        borderWidth="1px"
        borderColor={COLORS.border}
        bg={COLORS.card}
        boxShadow="none"
      >
        <Box position="relative" maxW="480px" w="100%">
          <Box
            position="absolute"
            left="12px"
            top="50%"
            transform="translateY(-50%)"
            color={COLORS.textMuted}
            zIndex={1}
            pointerEvents="none"
          >
            <Search size={17} strokeWidth={1.8} />
          </Box>

          <Input
            placeholder="Filtrar por placa ou motivo..."
            value={termo}
            onChange={(event) => setTermo(event.target.value)}
            h="42px"
            pl="38px"
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
        </Box>
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
                CABEÇALHO
            ================================================= */}

            <Table.Header>
              <Table.Row>
                <Table.ColumnHeader
                  fontWeight="700"
                  fontSize="11px"
                  textTransform="uppercase"
                >
                  Placa / NFs
                </Table.ColumnHeader>

                <Table.ColumnHeader
                  fontWeight="700"
                  fontSize="11px"
                  textTransform="uppercase"
                >
                  Motoristas
                </Table.ColumnHeader>

                <Table.ColumnHeader
                  fontWeight="700"
                  fontSize="11px"
                  textTransform="uppercase"
                >
                  Motivo da Retenção
                </Table.ColumnHeader>

                <Table.ColumnHeader
                  fontWeight="700"
                  fontSize="11px"
                  textTransform="uppercase"
                  textAlign="center"
                >
                  Qtd NFs
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
                CORPO
            ================================================= */}

            <Table.Body>
              {loading ? (
                <Table.Row>
                  <Table.Cell colSpan={6} textAlign="center" py="40px">
                    <Flex direction="column" align="center" gap="8px">
                      <Spinner size="md" color={COLORS.blue} />

                      <Text fontSize="13px" color={COLORS.textSecondary}>
                        Carregando retenções do sistema...
                      </Text>
                    </Flex>
                  </Table.Cell>
                </Table.Row>
              ) : retencoesFiltradas.length > 0 ? (
                retencoesFiltradas.map((item) => (
                  <Table.Row key={item.id}>
                    {/* Placa */}

                    <Table.Cell>
                      <Text
                        fontVariantNumeric="tabular-nums"
                        fontWeight="600"
                        color={COLORS.blue}
                        fontSize="13.5px"
                      >
                        {item.placa}
                      </Text>

                      <Text fontSize="12px" color={COLORS.textMuted}>
                        Total NFs: {item.quantidadeNfs}
                      </Text>
                    </Table.Cell>

                    {/* Motoristas */}

                    <Table.Cell
                      fontWeight="600"
                      color={COLORS.text}
                      fontSize="13.5px"
                    >
                      {item.motoristas?.join(", ") || "Não informado"}
                    </Table.Cell>

                    {/* Motivo */}

                    <Table.Cell color={COLORS.textSecondary} fontSize="13px">
                      {item.motivo || "Sem motivo especificado"}
                    </Table.Cell>

                    {/* Quantidade */}

                    <Table.Cell
                      textAlign="center"
                      fontVariantNumeric="tabular-nums"
                      fontWeight="600"
                      color={COLORS.text}
                      fontSize="13px"
                    >
                      {item.quantidadeNfs}
                    </Table.Cell>

                    {/* Status */}

                    <Table.Cell textAlign="center">
                      <Badge
                        px="8px"
                        py="3px"
                        borderRadius="full"
                        fontSize="11px"
                        fontWeight="600"
                        bg={COLORS.dangerSoft}
                        color={COLORS.danger}
                      >
                        Crítico
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
                            borderColor: COLORS.blue,
                            color: COLORS.text,
                          }}
                        >
                          Liberar Veículo
                        </Button>
                      </HStack>
                    </Table.Cell>
                  </Table.Row>
                ))
              ) : (
                <Table.Row>
                  <Table.Cell colSpan={6} textAlign="center" py="40px">
                    <Text color={COLORS.textMuted} fontSize="13px">
                      Nenhum veículo retido encontrado no banco de dados.
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
