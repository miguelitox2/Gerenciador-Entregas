import {
  Box,
  Flex,
  Text,
  VStack,
  IconButton,
  useDisclosure,
} from "@chakra-ui/react";
import { NavLink, Outlet } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";

export function Layout() {
  const { open, onToggle, onClose } = useDisclosure();
  const { user, logout } = useAuth0();

  const userInitial = user?.name
    ? user.name.charAt(0).toUpperCase()
    : user?.email?.charAt(0).toUpperCase() || "U";

  const menuItems = [
    { path: "/buscar", label: "Buscar NF", sub: "Operação do dia", icon: "🔍" },
    {
      path: "/ocorrencias",
      label: "Ocorrências",
      sub: "Painel e registros",
      icon: "📋",
    },
    { path: "/retencao", label: "Retenção", sub: "Veículo parado", icon: "🚛" },
    {
      path: "/importar",
      label: "Importar",
      sub: "Base do dia (.xlsx)",
      icon: "📥",
    },
  ];

  return (
    <Flex h="100vh" overflow="hidden" bg="#EFF3EF">
      <Box
        as="aside"
        w="262px"
        background="linear-gradient(180deg, #0E1B16, #122419)"
        color="#C9DDD3"
        h="100vh"
        position="sticky"
        top={0}
        display={{ base: open ? "block" : "none", md: "flex" }}
        flexDirection="column"
        borderRight="1px solid"
        borderColor="rgba(255, 255, 255, 0.06)"
        zIndex={60}
        css={{
          "@media (max-width: 900px)": {
            position: "fixed",
            left: 0,
            top: 0,
            transform: open ? "none" : "translateX(-100%)",
            transition: "transform 0.22s ease",
          },
        }}
      >
        <Flex p="22px 22px 18px" align="center" gap="10px" color="#8FD5B1">
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

        <VStack as="nav" align="stretch" gap="2px" px="12px" py="6px">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onClose}
              style={({ isActive }) => ({
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "11px 12px",
                borderRadius: "8px",
                textDecoration: "none",
                backgroundColor: isActive
                  ? "rgba(46, 139, 97, 0.2)"
                  : "transparent",
                color: isActive ? "#EAF3EE" : "#A9C2B6",
                boxShadow: isActive ? "inset 2px 0 0 #2E8B61" : "none",
              })}
            >
              <Text fontSize="18px">{item.icon}</Text>
              <Box lineHeight="1.25">
                <Text fontSize="14px" fontWeight="600" color="inherit">
                  {item.label}
                </Text>
                <Text fontSize="11px" opacity="0.7">
                  {item.sub}
                </Text>
              </Box>
            </NavLink>
          ))}
        </VStack>

        <Box mt="auto" p="16px" borderTop="1px solid rgba(255, 255, 255, 0.08)">
          <Flex align="center" gap="11px" mb="12px">
            <Flex
              w="34px"
              h="34px"
              align="center"
              justify="center"
              borderRadius="9px"
              bg="rgba(46, 139, 97, 0.28)"
              color="#8FD5B1"
              fontWeight="700"
              fontSize="14px"
              flex="0 0 auto"
            >
              {userInitial}
            </Flex>
            <Box minW={0} lineHeight="1.25">
              <Text fontSize="13px" fontWeight="600" color="#EAF3EE" truncate>
                {user?.name || "Usuário"}
              </Text>
              <Text fontSize="11px" color="#8CA79A" truncate>
                {user?.email || "operacao@empresa.com"}
              </Text>
            </Box>
          </Flex>

          <Box
            as="button"
            onClick={() =>
              logout({ logoutParams: { returnTo: window.location.origin } })
            }
            w="100%"
            py="8px"
            px="12px"
            borderRadius="8px"
            bg="transparent"
            border="1px solid rgba(255, 255, 255, 0.18)"
            color="#C9DDD3"
            fontSize="12.5px"
            fontWeight="600"
            cursor="pointer"
            _hover={{
              bg: "rgba(255, 255, 255, 0.08)",
              borderColor: "rgba(255, 255, 255, 0.3)",
            }}
          >
            Sair da conta
          </Box>
        </Box>
      </Box>

      <Flex flex="1" direction="column" overflowY="auto" minW={0}>
        <Flex
          as="header"
          display={{ base: "flex", md: "none" }}
          align="center"
          gap="12px"
          p="10px 14px"
          bg="white"
          borderBottom="1px solid"
          borderColor="#DCE3DB"
          position="sticky"
          top={0}
          zIndex={20}
        >
          <IconButton
            aria-label="Abrir menu"
            onClick={onToggle}
            variant="ghost"
          >
            ☰
          </IconButton>
          <Text fontWeight="600" color="#0E1B16">
            Controle de Entregas
          </Text>
        </Flex>

        <Box as="main" flex="1">
          <Outlet />
        </Box>
      </Flex>
    </Flex>
  );
}
