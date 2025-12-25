{ pkgs, ... }: {
  # Canal de pacotes estável para garantir a compatibilidade do Next.js
  channel = "stable-24.05";

  # Pacotes instalados diretamente na sua máquina virtual do Google
  packages = [
    pkgs.openssl
    pkgs.nodejs_20
    pkgs.nodePackages.npm
    pkgs.git
    pkgs.prisma-engines
  ];

  # Configurações do IDX
  idx = {
    # Extensões que ajudam no desenvolvimento
    extensions = [
      "bradlc.vscode-tailwindcss"      # Essencial para estilização
      "dbaeumer.vscode-eslint"         # Mantém o padrão de código
      "esbenp.prettier-vscode"         # Formatação de código
      "prisma.prisma"                  # Suporte para o banco de dados
      "dsznajder.es7-react-js-snippets" # Atalhos para React
    ];

    # Automação: O que o ambiente deve fazer ao ser criado e iniciado
    workspace = {
      # Executado quando o workspace é criado pela primeira vez
      onCreate = {
        npm-install = "npm install && npx prisma generate";
      };
      # Executado toda vez que o workspace é iniciado
      onStart = {
        # Garante que o Prisma Client seja gerado com os binários corretos do ambiente Nix
        prisma-generate = "unset NPM_CONFIG_PREFIX && npx prisma generate";
      };
    };

    # Configuração de Previews (Habilitando acesso externo para celulares)
    previews = {
      enable = true;
      previews = {
        web = {
          # Usamos npx next dev diretamente para garantir que o hostname 0.0.0.0 seja aplicado corretamente
          # Isso permite que você acesse a loja pelo celular usando o link de preview do IDX
          command = [
            "npm"
            "run"
            "dev"
            "--"
            "--port"
            "$PORT"
            "--hostname"
            "0.0.0.0"
          ];
          manager = "web";
        };
      };
    };
  };

  # Variáveis de ambiente configuradas para o NixOS do IDX
  env = {
    NODE_ENV = "development";

    # --- CONFIGURAÇÕES CRÍTICAS PARA O PRISMA ---
    # Informa ao sistema onde encontrar as bibliotecas do OpenSSL
    LD_LIBRARY_PATH = "${pkgs.lib.makeLibraryPath [ pkgs.openssl ]}";

    # Define explicitamente os binários que o Prisma deve usar dentro do ambiente Nix
    # Isso resolve o erro "Prisma failed to detect the libssl/openssl version"
    PRISMA_SCHEMA_ENGINE_BINARY = "${pkgs.prisma-engines}/bin/schema-engine";
    PRISMA_QUERY_ENGINE_LIBRARY = "${pkgs.prisma-engines}/lib/libquery_engine.node";

    # Ignora a verificação de checksum caso o Prisma tente baixar um binário incompatível
    PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING = "1";
  };
}