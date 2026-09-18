import { useState } from "react";
import {
  Box,
  Flex,
  Heading,
  Text,
  VStack,
  Input,
  Button,
  Grid,
  Container,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../config/api";

export function Login() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro("");

    if (!email || !senha) {
      setErro("Preencha o e-mail e a senha para continuar.");
      return;
    }

    setCarregando(true);

    try {
      const response = await fetch(`${API_URL}/api/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password: senha,
        }),
      });

      const data = await response.json();

      if (response.ok && data.token) {
        // Salva o token JWT real e o usuário retornados pelo Fastify
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));

        navigate("/buscar");
      } else {
        setErro(data.error || "E-mail ou senha inválidos.");
      }
    } catch (err) {
      console.error("Erro ao realizar login:", err);
      setErro("Falha ao conectar com o servidor Fastify.");
    } finally {
      setCarregando(false);
    }
  };

  return (
    <Grid
      minH="100vh"
      templateColumns={{
        base: "1fr",
        lg: "minmax(360px, 1fr) minmax(420px, 0.85fr)",
      }}
      w="100vw"
    >
      <Flex
        background="radial-gradient(700px 400px at 80% 0%, rgba(59,130,246,.18), transparent 60%), linear-gradient(160deg,#0B0D10 0%,#111318 60%,#0B0D10 100%)"
        color="#F1F5F9"
        p={{ base: "32px 24px", lg: "52px 48px" }}
        direction="column"
        justify="space-between"
        gap="40px"
        position="relative"
        overflow="hidden"
      >
        <Flex
          align="center"
          gap="10px"
          color="#60A5FA"
          position="relative"
          zIndex={1}
        >
          <svg
            viewBox="0 0 24 24"
            width="26px"
            height="26px"
            style={{ flex: "0 0 auto" }}
          >
            <path
              d="M4 19c0-6 4-11 10-12-1.5 3-1 5-3 7s-4 2-4 5z"
              fill="currentColor"
              opacity=".85"
            />
            <path
              d="M4 19c3 0 5-1 7-3"
              stroke="currentColor"
              strokeWidth="1.6"
              fill="none"
              strokeLinecap="round"
            />
          </svg>
          <Box>
            <Text
              fontSize="12.5px"
              fontWeight="600"
              letterSpacing="0.02em"
              lineHeight="1.15"
            >
              Controle de
            </Text>
            <Text fontSize="14px" fontWeight="600" letterSpacing="-0.01em">
              Entregas
            </Text>
          </Box>
        </Flex>

        <Heading
          fontSize="32px"
          lineHeight="1.18"
          fontWeight="600"
          letterSpacing="-0.03em"
          maxW="15ch"
          m={0}
          zIndex={1}
        >
          A ocorrência sai da rua e vira{" "}
          <Text as="em" fontStyle="normal" color="#60A5FA">
            registro
          </Text>{" "}
          no mesmo minuto.
        </Heading>

        <VStack
          as="ul"
          align="stretch"
          gap="14px"
          m={0}
          p={0}
          listStyleType="none"
          zIndex={1}
        >
          <Flex
            as="li"
            gap="12px"
            align="baseline"
            fontSize="13.5px"
            color="#94A3B8"
          >
            <Text
              as="span"
              fontFamily="mono"
              fontSize="11px"
              color="#60A5FA"
              letterSpacing="0.1em"
            >
              01
            </Text>
            <Box>
              <Text
                as="b"
                display="block"
                color="#F8FAFC"
                fontWeight="600"
                fontSize="14px"
              >
                Importe a planilha
              </Text>
              As notas do dia ficam disponíveis para todo o time.
            </Box>
          </Flex>
          <Flex
            as="li"
            gap="12px"
            align="baseline"
            fontSize="13.5px"
            color="#94A3B8"
          >
            <Text
              as="span"
              fontFamily="mono"
              fontSize="11px"
              color="#60A5FA"
              letterSpacing="0.1em"
            >
              02
            </Text>
            <Box>
              <Text
                as="b"
                display="block"
                color="#F8FAFC"
                fontWeight="600"
                fontSize="14px"
              >
                Registre por item
              </Text>
              Devolução, quebra e valor calculados linha a linha.
            </Box>
          </Flex>
          <Flex
            as="li"
            gap="12px"
            align="baseline"
            fontSize="13.5px"
            color="#94A3B8"
          >
            <Text
              as="span"
              fontFamily="mono"
              fontSize="11px"
              color="#60A5FA"
              letterSpacing="0.1em"
            >
              03
            </Text>
            <Box>
              <Text
                as="b"
                display="block"
                color="#F8FAFC"
                fontWeight="600"
                fontSize="14px"
              >
                Avise o vendedor
              </Text>
              O rascunho abre no Outlook já preenchido.
            </Box>
          </Flex>
        </VStack>
      </Flex>

      <Flex
        align="center"
        justify="center"
        p={{ base: "32px 20px", lg: "40px 32px" }}
        bg="#111318"
        color="#F1F5F9"
      >
        <Container maxW="380px" w="100%" p={0}>
          <form onSubmit={handleLogin}>
            <Text
              fontSize="11px"
              fontWeight="700"
              letterSpacing="0.14em"
              textTransform="uppercase"
              color="#3B82F6"
              mb="6px"
            >
              Acesso restrito
            </Text>
            <Heading
              color="#F8FAFC"
              fontSize="25px"
              fontWeight="600"
              letterSpacing="-0.025em"
              lineHeight="1.2"
              mb="6px"
            >
              Entre para registrar as ocorrências do dia
            </Heading>
            <Text color="#A8B3C2" fontSize="13.5px" mb="24px">
              Use seu e-mail corporativo cadastrado no banco.
            </Text>

            {erro && (
              <Box
                bg="rgba(239,68,68,.12)"
                color="#F87171"
                p="10px"
                borderRadius="8px"
                fontSize="13px"
                mb="16px"
                border="1px solid #F2C9C4"
              >
                {erro}
              </Box>
            )}

            <Box mb="16px">
              <Text
                as="label"
                display="block"
                fontSize="10.5px"
                fontWeight="700"
                letterSpacing="0.09em"
                textTransform="uppercase"
                color="#CBD5E1"
                mb="6px"
              >
                E-mail corporativo
              </Text>
              <Input
                type="email"
                placeholder="voce@empresa.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                h="44px"
                fontSize="14px"
                borderColor="#353B47"
                _focus={{
                  borderColor: "#3B82F6",
                  boxShadow: "0 0 0 3px rgba(59,130,246,.14)",
                }}
              />
            </Box>

            <Box mb="24px">
              <Text
                as="label"
                display="block"
                fontSize="10.5px"
                fontWeight="700"
                letterSpacing="0.09em"
                textTransform="uppercase"
                color="#CBD5E1"
                mb="6px"
              >
                Senha
              </Text>
              <Input
                type="password"
                placeholder="••••••••"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                h="44px"
                fontSize="14px"
                borderColor="#353B47"
                _focus={{
                  borderColor: "#3B82F6",
                  boxShadow: "0 0 0 3px rgba(59,130,246,.14)",
                }}
              />
            </Box>

            <Button
              type="submit"
              disabled={carregando}
              w="100%"
              h="48px"
              bg="#3B82F6"
              color="white"
              fontWeight="600"
              fontSize="14px"
              borderRadius="8px"
              _hover={{ bg: "#2563EB" }}
              _disabled={{ opacity: 0.6, cursor: "not-allowed" }}
            >
              {carregando ? "Autenticando..." : "Entrar"}
            </Button>

            <Text
              mt="28px"
              pt="18px"
              borderTop="1px solid"
              borderColor="#252932"
              fontSize="12px"
              color="#A8B3C2"
            >
              Ocorrências e retenções ficam registradas com o nome de quem as
              criou.
            </Text>
          </form>
        </Container>
      </Flex>
    </Grid>
  );
}
