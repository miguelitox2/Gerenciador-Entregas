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

export function Retencao() {
  const [termo, setTermo] = useState("");
  const [retencoes, setRetencoes] = useState<RetencaoItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Busca as retenções reais do backend Fastify
  useEffect(() => {
    fetch(`${API_URL}/api/retencoes`)
      .then((res) => res.json())
      .then((data) => {
        if (data.retencoes) {
          setRetencoes(data.retencoes);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Erro ao buscar retenções:", err);
        setLoading(false);
      });
  }, []);

  // Filtra as retenções pela placa ou motivo
  const retencoesFiltradas = retencoes.filter((item) => {
    const search = termo.toLowerCase();
    const placa = item.placa?.toLowerCase() || "";
    const motivo = item.motivo?.toLowerCase() || "";

    return placa.includes(search) || motivo.includes(search);
  });

  // Métricas dinâmicas
  const totalVeiculos = retencoes.length;

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
            Retenção de Veículos
          </Heading>
          <Text fontSize="13.5px" color="#5A6E63" mt="2px">
            Monitore veículos parados em clientes, postos fiscais ou centros de
            distribuição.
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
          + Registrar Retenção
        </Button>
      </Flex>

      <SimpleGrid columns={{ base: 1, sm: 2, lg: 3 }} gap="16px" mb="24px">
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
            Veículos Retidos Agora
          </Text>
          <Text
            fontSize="24px"
            fontWeight="600"
            color="#8C5A00"
            fontVariantNumeric="tabular-nums"
          >
            {totalVeiculos} veículos
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
            Tempo Médio de Retenção
          </Text>
          <Text
            fontSize="24px"
            fontWeight="600"
            color="#12281E"
            fontVariantNumeric="tabular-nums"
          >
            -
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
            Liberados Hoje
          </Text>
          <Text
            fontSize="24px"
            fontWeight="600"
            color="#1F6B4A"
            fontVariantNumeric="tabular-nums"
          >
            0 veículos
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
            placeholder="Filtrar por placa ou motivo..."
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
                  Placa / NFs
                </Table.ColumnHeader>
                <Table.ColumnHeader
                  color="#3A4D43"
                  fontWeight="700"
                  fontSize="11px"
                  textTransform="uppercase"
                >
                  Motoristas
                </Table.ColumnHeader>
                <Table.ColumnHeader
                  color="#3A4D43"
                  fontWeight="700"
                  fontSize="11px"
                  textTransform="uppercase"
                >
                  Motivo da Retenção
                </Table.ColumnHeader>
                <Table.ColumnHeader
                  color="#3A4D43"
                  fontWeight="700"
                  fontSize="11px"
                  textTransform="uppercase"
                  textAlign="center"
                >
                  Qtd NFs
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
                      Carregando retenções do sistema...
                    </Text>
                  </Table.Cell>
                </Table.Row>
              ) : retencoesFiltradas.length > 0 ? (
                retencoesFiltradas.map((item) => (
                  <Table.Row key={item.id} _hover={{ bg: "#FAFCFA" }}>
                    <Table.Cell>
                      <Text
                        fontVariantNumeric="tabular-nums"
                        fontWeight="600"
                        color="#1F6B4A"
                        fontSize="13.5px"
                      >
                        {item.placa}
                      </Text>
                      <Text fontSize="12px" color="#6E8277">
                        Total NFs: {item.quantidadeNfs}
                      </Text>
                    </Table.Cell>
                    <Table.Cell
                      fontWeight="600"
                      color="#12281E"
                      fontSize="13.5px"
                    >
                      {item.motoristas?.join(", ") || "Não informado"}
                    </Table.Cell>
                    <Table.Cell color="#4C5D55" fontSize="13px">
                      {item.motivo || "Sem motivo especificado"}
                    </Table.Cell>
                    <Table.Cell
                      textAlign="center"
                      fontVariantNumeric="tabular-nums"
                      fontWeight="600"
                      color="#12281E"
                      fontSize="13px"
                    >
                      {item.quantidadeNfs}
                    </Table.Cell>
                    <Table.Cell textAlign="center">
                      <Badge
                        px="8px"
                        py="3px"
                        borderRadius="full"
                        fontSize="11px"
                        fontWeight="600"
                        bg="#FEECEB"
                        color="#A61C1C"
                      >
                        Crítico
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
                          Liberar Veículo
                        </Button>
                      </HStack>
                    </Table.Cell>
                  </Table.Row>
                ))
              ) : (
                <Table.Row>
                  <Table.Cell
                    colSpan={6}
                    textAlign="center"
                    py="40px"
                    color="#6E8277"
                  >
                    Nenhum veículo retido encontrado no banco de dados.
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
