import { useState } from "react";
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
} from "@chakra-ui/react";

const ocorrenciasMock = [
  {
    id: "1",
    nf: "48292",
    cliente: "Comercial Alimentos São José",
    tipo: "Devolução Parcial",
    motivo: "Produto avariado no transporte",
    valor: "R$ 1.250,00",
    status: "Pendente",
    data: "14/09/2026",
  },
  {
    id: "2",
    nf: "48293",
    cliente: "Atacadista Bom Preço S/A",
    tipo: "Quebra / Avaria",
    motivo: "Caixas amassadas / vazamento",
    valor: "R$ 3.400,00",
    status: "Em Análise",
    data: "13/09/2026",
  },
  {
    id: "3",
    nf: "48280",
    cliente: "Supermercado Econômico Ltda",
    tipo: "Falta de Carga",
    motivo: "Divergência na conferência física",
    valor: "R$ 890,00",
    status: "Resolvido",
    data: "12/09/2026",
  },
  {
    id: "4",
    nf: "48275",
    cliente: "Mercearia da Vila",
    tipo: "Recusa Total",
    motivo: "Cliente fechado no momento da entrega",
    valor: "R$ 2.150,00",
    status: "Pendente",
    data: "11/09/2026",
  },
];

export function Ocorrencias() {
  const [termo, setTermo] = useState("");

  const ocorrenciasFiltradas = ocorrenciasMock.filter(
    (item) =>
      item.nf.includes(termo) ||
      item.cliente.toLowerCase().includes(termo.toLowerCase()) ||
      item.tipo.toLowerCase().includes(termo.toLowerCase()),
  );

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
            38 registros
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
            12 ocorrências
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
            R$ 28.450,00
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
            26 ocorrências
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
            placeholder="Filtrar por número da NF, cliente ou tipo de ocorrência..."
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
                  Tipo
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
              {ocorrenciasFiltradas.length > 0 ? (
                ocorrenciasFiltradas.map((item) => (
                  <Table.Row key={item.id} _hover={{ bg: "#FAFCFA" }}>
                    <Table.Cell
                      fontVariantNumeric="tabular-nums"
                      fontWeight="600"
                      color="#1F6B4A"
                    >
                      #{item.nf}
                    </Table.Cell>
                    <Table.Cell>
                      <Text fontWeight="600" color="#12281E" fontSize="13.5px">
                        {item.cliente}
                      </Text>
                      <Text fontSize="12px" color="#6E8277">
                        {item.motivo}
                      </Text>
                    </Table.Cell>
                    <Table.Cell>
                      <Badge
                        variant="subtle"
                        colorScheme="gray"
                        fontSize="11px"
                        px="6px"
                        py="2px"
                      >
                        {item.tipo}
                      </Badge>
                    </Table.Cell>
                    <Table.Cell
                      fontVariantNumeric="tabular-nums"
                      fontWeight="600"
                      textAlign="right"
                      color="#12281E"
                      fontSize="13px"
                    >
                      {item.valor}
                    </Table.Cell>
                    <Table.Cell textAlign="center">
                      <Badge
                        px="8px"
                        py="3px"
                        borderRadius="full"
                        fontSize="11px"
                        fontWeight="600"
                        bg={
                          item.status === "Resolvido"
                            ? "#E1F3EA"
                            : item.status === "Em Análise"
                              ? "#FDF3E3"
                              : "#FEECEB"
                        }
                        color={
                          item.status === "Resolvido"
                            ? "#1B653B"
                            : item.status === "Em Análise"
                              ? "#8C5A00"
                              : "#A61C1C"
                        }
                      >
                        {item.status}
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
                ))
              ) : (
                <Table.Row>
                  <Table.Cell
                    colSpan={6}
                    textAlign="center"
                    py="40px"
                    color="#6E8277"
                  >
                    Nenhuma ocorrência encontrada para o filtro informado.
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
