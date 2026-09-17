import { useState, useEffect } from "react";
import {
  Box,
  Flex,
  Heading,
  Text,
  Input,
  Button,
  Table,
  Badge,
  HStack,
  Card,
  SimpleGrid,
  Spinner,
} from "@chakra-ui/react";
import { API_URL } from "../config/api";

interface Ocorrencia {
  id: string;
  numeroNf: string;
  cliente?: string;
  motivo: string;
  observacao?: string;
  totalValor?: number;
  criadoEm: string;
}

export function Ocorrencias() {
  const [termo, setTermo] = useState("");
  const [ocorrencias, setOcorrencias] = useState<Ocorrencia[]>([]);
  const [loading, setLoading] = useState(true);

  // Busca as ocorrências reais do backend Fastify
  useEffect(() => {
    fetch(`${API_URL}/api/ocorrencias`)
      .then((res) => res.json())
      .then((data) => {
        if (data.ocorrencias) {
          setOcorrencias(data.ocorrencias);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Erro ao buscar ocorrências:", err);
        setLoading(false);
      });
  }, []);

  // Filtra as ocorrências pelo termo digitado (NF, cliente ou motivo)
  const ocorrenciasFiltradas = ocorrencias.filter((item) => {
    const search = termo.toLowerCase();
    const nf = item.numeroNf?.toLowerCase() || "";
    const cliente = item.cliente?.toLowerCase() || "";
    const motivo = item.motivo?.toLowerCase() || "";

    return (
      nf.includes(search) || cliente.includes(search) || motivo.includes(search)
    );
  });

  // Cálculos dinâmicos baseados nos dados reais
  const totalMes = ocorrencias.length;
  const valorTotalAfetado = ocorrencias.reduce(
    (acc, curr) => acc + (curr.totalValor || 0),
    0,
  );
  const valorFormatadoTotal = valorTotalAfetado.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

  return (
    <Box p={{ base: "20px", lg: "32px" }} maxW="1400px" mx="auto">
      <Flex
        justify="space-between"
        align="center"
        mb="24px"
        wrap="wrap"
        gap="16px"
      >
        <Box>
          <Heading
            fontSize="22px"
            fontWeight="600"
            color="#12281E"
            letterSpacing="-0.02em"
          >
            Painel de Ocorrências
          </Heading>
          <Text fontSize="13.5px" color="#5A6E63" mt="2px">
            Gerencie desvios, quebras, devoluções e divergências de entrega da
            operação.
          </Text>
        </Box>
        <Button
          bg="#1F6B4A"
          color="white"
          h="42px"
          px="16px"
          fontSize="13.5px"
          fontWeight="600"
          _hover={{ bg: "#134936" }}
        >
          + Nova Ocorrência
        </Button>
      </Flex>

      <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} gap="16px" mb="24px">
        <Card.Root
          p="16px"
          borderRadius="10px"
          borderWidth="1px"
          borderColor="#DCE3DB"
          bg="white"
        >
          <Text
            fontSize="11px"
            fontWeight="700"
            letterSpacing="0.08em"
            textTransform="uppercase"
            color="#5A6E63"
            mb="4px"
          >
            Total no Mês
          </Text>
          <Text
            fontSize="24px"
            fontWeight="600"
            color="#12281E"
            fontVariantNumeric="tabular-nums"
          >
            {totalMes} registros
          </Text>
        </Card.Root>

        <Card.Root
          p="16px"
          borderRadius="10px"
          borderWidth="1px"
          borderColor="#DCE3DB"
          bg="white"
        >
          <Text
            fontSize="11px"
            fontWeight="700"
            letterSpacing="0.08em"
            textTransform="uppercase"
            color="#5A6E63"
            mb="4px"
          >
            Pendentes de Ação
          </Text>
          <Text
            fontSize="24px"
            fontWeight="600"
            color="#8C5A00"
            fontVariantNumeric="tabular-nums"
          >
            {totalMes} ocorrências
          </Text>
        </Card.Root>

        <Card.Root
          p="16px"
          borderRadius="10px"
          borderWidth="1px"
          borderColor="#DCE3DB"
          bg="white"
        >
          <Text
            fontSize="11px"
            fontWeight="700"
            letterSpacing="0.08em"
            textTransform="uppercase"
            color="#5A6E63"
            mb="4px"
          >
            Valor Afetado
          </Text>
          <Text
            fontSize="24px"
            fontWeight="600"
            color="#12281E"
            fontVariantNumeric="tabular-nums"
          >
            {valorFormatadoTotal}
          </Text>
        </Card.Root>

        <Card.Root
          p="16px"
          borderRadius="10px"
          borderWidth="1px"
          borderColor="#DCE3DB"
          bg="white"
        >
          <Text
            fontSize="11px"
            fontWeight="700"
            letterSpacing="0.08em"
            textTransform="uppercase"
            color="#5A6E63"
            mb="4px"
          >
            Resolvidas
          </Text>
          <Text
            fontSize="24px"
            fontWeight="600"
            color="#1F6B4A"
            fontVariantNumeric="tabular-nums"
          >
            0 ocorrências
          </Text>
        </Card.Root>
      </SimpleGrid>

      <Card.Root
        p="16px"
        mb="24px"
        borderRadius="10px"
        borderWidth="1px"
        borderColor="#DCE3DB"
        bg="white"
      >
        <Flex gap="12px" wrap="wrap">
          <Input
            placeholder="Filtrar por número da NF, cliente ou motivo..."
            value={termo}
            onChange={(e) => setTermo(e.target.value)}
            maxW="480px"
            h="42px"
            fontSize="13.5px"
            borderColor="#C3CFC2"
            _focus={{
              borderColor: "#1F6B4A",
              boxShadow: "0 0 0 3px rgba(31,107,74,.14)",
            }}
          />
        </Flex>
      </Card.Root>

      <Card.Root
        borderRadius="10px"
        borderWidth="1px"
        borderColor="#DCE3DB"
        bg="white"
        overflow="hidden"
      >
        <Box overflowX="auto">
          <Table.Root size="sm" variant="line">
            <Table.Header bg="#F7F9F8">
              <Table.Row>
                <Table.ColumnHeader
                  color="#3A4D43"
                  fontWeight="700"
                  fontSize="11px"
                  textTransform="uppercase"
                >
                  NF
                </Table.ColumnHeader>
                <Table.ColumnHeader
                  color="#3A4D43"
                  fontWeight="700"
                  fontSize="11px"
                  textTransform="uppercase"
                >
                  Cliente / Motivo
                </Table.ColumnHeader>
                <Table.ColumnHeader
                  color="#3A4D43"
                  fontWeight="700"
                  fontSize="11px"
                  textTransform="uppercase"
                >
                  Data
                </Table.ColumnHeader>
                <Table.ColumnHeader
                  color="#3A4D43"
                  fontWeight="700"
                  fontSize="11px"
                  textTransform="uppercase"
                  textAlign="right"
                >
                  Valor
                </Table.ColumnHeader>
                <Table.ColumnHeader
                  color="#3A4D43"
                  fontWeight="700"
                  fontSize="11px"
                  textTransform="uppercase"
                  textAlign="center"
                >
                  Status
                </Table.ColumnHeader>
                <Table.ColumnHeader
                  color="#3A4D43"
                  fontWeight="700"
                  fontSize="11px"
                  textTransform="uppercase"
                  textAlign="right"
                >
                  Ações
                </Table.ColumnHeader>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {loading ? (
                <Table.Row>
                  <Table.Cell colSpan={6} textAlign="center" py="40px">
                    <Spinner size="md" color="#1F6B4A" />
                    <Text mt="2" fontSize="13px" color="#6E8277">
                      Carregando ocorrências do sistema...
                    </Text>
                  </Table.Cell>
                </Table.Row>
              ) : ocorrenciasFiltradas.length > 0 ? (
                ocorrenciasFiltradas.map((item) => {
                  const dataFormatada = new Date(
                    item.criadoEm,
                  ).toLocaleDateString("pt-BR");
                  const valorFormatado = Number(
                    item.totalValor || 0,
                  ).toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  });

                  return (
                    <Table.Row key={item.id} _hover={{ bg: "#FAFCFA" }}>
                      <Table.Cell
                        fontVariantNumeric="tabular-nums"
                        fontWeight="600"
                        color="#1F6B4A"
                      >
                        #{item.numeroNf}
                      </Table.Cell>
                      <Table.Cell>
                        <Text
                          fontWeight="600"
                          color="#12281E"
                          fontSize="13.5px"
                        >
                          {item.cliente || "Cliente não informado"}
                        </Text>
                        <Text fontSize="12px" color="#6E8277">
                          {item.motivo}
                        </Text>
                      </Table.Cell>
                      <Table.Cell
                        fontVariantNumeric="tabular-nums"
                        color="#4C5D55"
                        fontSize="13px"
                      >
                        {dataFormatada}
                      </Table.Cell>
                      <Table.Cell
                        fontVariantNumeric="tabular-nums"
                        fontWeight="600"
                        textAlign="right"
                        color="#12281E"
                        fontSize="13px"
                      >
                        {valorFormatado}
                      </Table.Cell>
                      <Table.Cell textAlign="center">
                        <Badge
                          px="8px"
                          py="3px"
                          borderRadius="full"
                          fontSize="11px"
                          fontWeight="600"
                          bg="#FDF3E3"
                          color="#8C5A00"
                        >
                          Pendente
                        </Badge>
                      </Table.Cell>
                      <Table.Cell textAlign="right">
                        <HStack justify="flex-end" gap="8px">
                          <Button
                            size="xs"
                            variant="outline"
                            borderColor="#C3CFC2"
                            color="#1F6B4A"
                            _hover={{ bg: "#EBF3EF" }}
                          >
                            Detalhes / Outlook
                          </Button>
                        </HStack>
                      </Table.Cell>
                    </Table.Row>
                  );
                })
              ) : (
                <Table.Row>
                  <Table.Cell
                    colSpan={6}
                    textAlign="center"
                    py="40px"
                    color="#6E8277"
                  >
                    Nenhuma ocorrência encontrada no banco de dados.
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
