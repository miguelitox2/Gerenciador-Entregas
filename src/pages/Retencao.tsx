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

const retencoesMock = [
  {
    id: "1",
    placa: "ABC-1234",
    motorista: "Carlos Silva",
    cliente: "Atacadista Bom Preço S/A",
    motivo: "Divergência na nota fiscal (Fiscal)",
    tempo: "4h 20m",
    status: "Crítico",
    data: "15/09/2026",
  },
  {
    id: "2",
    placa: "XYZ-9876",
    motorista: "Roberto Souza",
    cliente: "Comercial Alimentos São José",
    motivo: "Atraso na liberação da doca",
    tempo: "2h 10m",
    status: "Em Acompanhamento",
    data: "15/09/2026",
  },
  {
    id: "3",
    placa: "DEF-5678",
    motorista: "Marcos Oliveira",
    cliente: "Supermercado Compre Bem Ltda",
    motivo: "Conferência física divergente",
    tempo: "1h 45m",
    status: "Em Acompanhamento",
    data: "14/09/2026",
  },
];

export function Retencao() {
  const [termo, setTermo] = useState("");

  const retencoesFiltradas = retencoesMock.filter(
    (item) =>
      item.placa.toLowerCase().includes(termo.toLowerCase()) ||
      item.motorista.toLowerCase().includes(termo.toLowerCase()) ||
      item.cliente.toLowerCase().includes(termo.toLowerCase()),
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
            3 veículos
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
            2h 45m
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
            5 veículos
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
            placeholder="Filtrar por placa, motorista ou cliente..."
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
                  Placa / Motorista
                </Table.ColumnHeader>
                <Table.ColumnHeader
                  color="#3A4D43"
                  fontWeight="700"
                  fontSize="11px"
                  textTransform="uppercase"
                >
                  Cliente / Local
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
                  Tempo Parado
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
              {retencoesFiltradas.length > 0 ? (
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
                        {item.motorista}
                      </Text>
                    </Table.Cell>
                    <Table.Cell
                      fontWeight="600"
                      color="#12281E"
                      fontSize="13.5px"
                    >
                      {item.cliente}
                    </Table.Cell>
                    <Table.Cell color="#4C5D55" fontSize="13px">
                      {item.motivo}
                    </Table.Cell>
                    <Table.Cell
                      textAlign="center"
                      fontVariantNumeric="tabular-nums"
                      fontWeight="600"
                      color="#8C5A00"
                      fontSize="13px"
                    >
                      {item.tempo}
                    </Table.Cell>
                    <Table.Cell textAlign="center">
                      <Badge
                        px="8px"
                        py="3px"
                        borderRadius="full"
                        fontSize="11px"
                        fontWeight="600"
                        bg={item.status === "Crítico" ? "#FEECEB" : "#FDF3E3"}
                        color={
                          item.status === "Crítico" ? "#A61C1C" : "#8C5A00"
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
                    Nenhum veículo retido encontrado para o filtro informado.
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
