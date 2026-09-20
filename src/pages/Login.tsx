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

import { PackageCheck, ArrowRight, ShieldCheck } from "lucide-react";

import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { API_URL } from "../config/api";

const COLORS = {
  background: "#0F1115",
  panel: "#111318",
  panelSoft: "#141820",
  border: "#252932",
  borderHover: "#343A46",

  text: "#F1F5F9",
  textSecondary: "#A1A8B3",
  textMuted: "#69717E",

  blue: "#3B82F6",
  blueHover: "#2563EB",
  blueSoft: "rgba(59, 130, 246, 0.10)",

  danger: "#F87171",
  dangerSoft: "rgba(239, 68, 68, 0.10)",
};

export function Login() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro("");

    if (!email.trim() || !senha) {
      const mensagem = "Preencha o e-mail e a senha para continuar.";

      toast.warning(mensagem);
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
          email: email.trim(),
          password: senha,
        }),
      });

      const data = await response.json();

      if (response.ok && data.token) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));

        const nomeUsuario = data.user?.name || "usuário";

        toast.success(`Bem-vindo, ${nomeUsuario}!`, {
          description: "Seu acesso foi realizado com sucesso.",
          duration: 3500,
        });

        navigate("/buscar");
      } else {
        const mensagem = "E-mail ou senha inválidos.";

        toast.warning(mensagem);
      }
    } catch (error) {
      console.error("Erro ao realizar login:", error);
      setErro("Falha ao conectar com o servidor.");
    } finally {
      setCarregando(false);
    }
  };

  return (
    <Grid
      minH="100vh"
      w="100vw"
      templateColumns={{
        base: "1fr",
        lg: "minmax(480px, 1.15fr) minmax(420px, 0.85fr)",
      }}
      bg={COLORS.background}
    >
      {/* =========================================================
          LADO INSTITUCIONAL
      ========================================================= */}
      <Flex
        display={{ base: "none", lg: "flex" }}
        direction="column"
        justify="space-between"
        position="relative"
        overflow="hidden"
        px={{ lg: "56px", xl: "72px" }}
        py="42px"
        color={COLORS.text}
        borderRight="1px solid"
        borderColor={COLORS.border}
        bg={COLORS.background}
      >
        {/* Luz ambiente */}
        <Box
          position="absolute"
          top="-280px"
          left="-120px"
          w="620px"
          h="620px"
          borderRadius="full"
          bg="rgba(59, 130, 246, 0.055)"
          filter="blur(90px)"
          pointerEvents="none"
        />

        {/* Marca */}
        <Flex align="center" gap="11px" position="relative" zIndex={1}>
          <Flex
            align="center"
            justify="center"
            w="38px"
            h="38px"
            borderRadius="11px"
            bg={COLORS.blueSoft}
            color={COLORS.blue}
          >
            <PackageCheck size={19} strokeWidth={1.8} />
          </Flex>

          <Box>
            <Text
              fontSize="10px"
              fontWeight="600"
              letterSpacing="0.12em"
              textTransform="uppercase"
              color={COLORS.textMuted}
              lineHeight="1.2"
            >
              Controle de
            </Text>

            <Text
              fontSize="14px"
              fontWeight="700"
              color={COLORS.text}
              lineHeight="1.3"
            >
              Entregas
            </Text>
          </Box>
        </Flex>

        {/* Mensagem principal */}
        <Box position="relative" zIndex={1} maxW="570px" mt="-40px">
          <Text
            fontSize="11px"
            fontWeight="700"
            letterSpacing="0.16em"
            textTransform="uppercase"
            color={COLORS.blue}
            mb="16px"
          >
            Operação centralizada
          </Text>

          <Heading
            fontSize={{
              lg: "42px",
              xl: "48px",
            }}
            lineHeight="1.08"
            fontWeight="600"
            letterSpacing="-0.045em"
            maxW="10ch"
            color={COLORS.text}
            mb="22px"
          >
            Controle das entregas em um só lugar.
          </Heading>

          <Text
            fontSize="14px"
            lineHeight="1.8"
            color={COLORS.textSecondary}
            maxW="520px"
          >
            Consulte notas fiscais, registre ocorrências e acompanhe a operação
            com as informações organizadas para toda a equipe.
          </Text>

          <Flex align="center" gap="8px" mt="30px" color={COLORS.textMuted}>
            <ArrowRight size={14} strokeWidth={1.7} />

            <Text fontSize="12px" letterSpacing="0.01em">
              Uma visão mais clara da operação.
            </Text>
          </Flex>
        </Box>

        {/* Rodapé */}
        <Flex
          align="center"
          justify="space-between"
          position="relative"
          zIndex={1}
          pt="20px"
        >
          <Text fontSize="10px" color={COLORS.textMuted}>
            Gerenciador de Entregas
          </Text>

          <Text fontSize="10px" color={COLORS.textMuted}>
            Operação & Controle
          </Text>
        </Flex>
      </Flex>

      {/* =========================================================
          LOGIN
      ========================================================= */}
      <Flex
        align="center"
        justify="center"
        minH="100vh"
        px={{ base: "24px", md: "40px", lg: "64px" }}
        py="40px"
        bg={COLORS.panel}
        color={COLORS.text}
      >
        <Container maxW="390px" w="100%" p={0}>
          <form onSubmit={handleLogin}>
            {/* Ícone */}
            <Flex
              align="center"
              justify="center"
              w="40px"
              h="40px"
              borderRadius="11px"
              bg={COLORS.blueSoft}
              color={COLORS.blue}
              mb="22px"
            >
              <ArrowRight size={19} strokeWidth={1.8} />
            </Flex>

            {/* Cabeçalho */}
            <Text
              fontSize="10px"
              fontWeight="700"
              letterSpacing="0.15em"
              textTransform="uppercase"
              color={COLORS.blue}
              mb="7px"
            >
              Acesso restrito
            </Text>

            <Heading
              fontSize={{
                base: "27px",
                md: "29px",
              }}
              fontWeight="600"
              letterSpacing="-0.035em"
              lineHeight="1.15"
              color={COLORS.text}
              mb="8px"
            >
              Entre na sua conta
            </Heading>

            <Text
              fontSize="13px"
              lineHeight="1.6"
              color={COLORS.textSecondary}
              mb="30px"
            >
              Acesse o Gerenciador de Entregas para acompanhar a operação.
            </Text>

            {/* Erro */}
            {erro && (
              <Box
                mb="18px"
                px="12px"
                py="11px"
                borderRadius="8px"
                border="1px solid"
                borderColor="rgba(248, 113, 113, 0.25)"
                bg={COLORS.dangerSoft}
                color={COLORS.danger}
                fontSize="12px"
                lineHeight="1.5"
              >
                {erro}
              </Box>
            )}

            <VStack align="stretch" gap="0">
              {/* E-mail */}
              <Box mb="17px">
                <Text
                  as="label"
                  display="block"
                  fontSize="10px"
                  fontWeight="700"
                  letterSpacing="0.09em"
                  textTransform="uppercase"
                  color="#CBD5E1"
                  mb="7px"
                >
                  E-mail
                </Text>

                <Input
                  type="email"
                  value={email}
                  placeholder="voce@empresa.com"
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  h="46px"
                  px="13px"
                  fontSize="13px"
                  color={COLORS.text}
                  bg={COLORS.background}
                  borderColor={COLORS.borderHover}
                  borderRadius="8px"
                  _placeholder={{
                    color: COLORS.textMuted,
                  }}
                  _hover={{
                    borderColor: "#454C59",
                  }}
                  _focus={{
                    borderColor: COLORS.blue,
                    boxShadow: `0 0 0 3px ${COLORS.blueSoft}`,
                  }}
                />
              </Box>

              {/* Senha */}
              <Box mb="23px">
                <Text
                  as="label"
                  display="block"
                  fontSize="10px"
                  fontWeight="700"
                  letterSpacing="0.09em"
                  textTransform="uppercase"
                  color="#CBD5E1"
                  mb="7px"
                >
                  Senha
                </Text>

                <Input
                  type="password"
                  value={senha}
                  placeholder="••••••••"
                  onChange={(e) => setSenha(e.target.value)}
                  autoComplete="current-password"
                  h="46px"
                  px="13px"
                  fontSize="13px"
                  color={COLORS.text}
                  bg={COLORS.background}
                  borderColor={COLORS.borderHover}
                  borderRadius="8px"
                  _placeholder={{
                    color: COLORS.textMuted,
                  }}
                  _hover={{
                    borderColor: "#454C59",
                  }}
                  _focus={{
                    borderColor: COLORS.blue,
                    boxShadow: `0 0 0 3px ${COLORS.blueSoft}`,
                  }}
                />
              </Box>

              {/* Botão */}
              <Button
                type="submit"
                w="100%"
                h="46px"
                borderRadius="8px"
                bg={COLORS.blue}
                color="white"
                fontSize="13px"
                fontWeight="600"
                disabled={carregando}
                _hover={{
                  bg: COLORS.blueHover,
                }}
                _active={{
                  transform: "translateY(1px)",
                }}
                _disabled={{
                  opacity: 0.6,
                  cursor: "not-allowed",
                }}
              >
                {carregando ? "Autenticando..." : "Entrar"}
              </Button>
            </VStack>

            {/* Segurança / rodapé */}
            <Flex
              align="center"
              gap="8px"
              mt="26px"
              pt="17px"
              borderTop="1px solid"
              borderColor={COLORS.border}
            >
              <ShieldCheck
                size={14}
                strokeWidth={1.6}
                color={COLORS.textMuted}
              />

              <Text fontSize="10.5px" color={COLORS.textMuted} lineHeight="1.4">
                Acesso exclusivo para usuários cadastrados.
              </Text>
            </Flex>
          </form>
        </Container>
      </Flex>
    </Grid>
  );
}
