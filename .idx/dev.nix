{ pkgs, ... }: {
  # MUDANÇA 1: Usar o canal unstable para ter acesso ao Node 22.12+
  channel = "unstable"; 

  packages = [
    pkgs.openssl
    pkgs.nodejs_22  # No canal unstable, isso baixará a versão mais recente (>=22.12)
    pkgs.nodePackages.npm
    pkgs.git
    # REMOVIDO: pkgs.prisma-engines (Deixe o Prisma 7 baixar a engine compatível dele)
  ];

  # Configurações do IDX
 idx = {
    extensions = [
      "bradlc.vscode-tailwindcss"
      "dbaeumer.vscode-eslint"
      "esbenp.prettier-vscode"
      "prisma.prisma"
      "dsznajder.es7-react-js-snippets"
    ];

    workspace = {
      onCreate = {
        npm-install = "npm install && npx prisma generate";
      };
      onStart = {
        prisma-generate = "unset NPM_CONFIG_PREFIX && npx prisma generate";
      };
    };

    previews = {
      enable = true;
      previews = {
        web = {
          command = [ "npm" "run" "dev" "--" "--port" "$PORT" "--hostname" "0.0.0.0" ];
          manager = "web";
        };
      };
    };
  };

  env = {
    NODE_ENV = "development";
    # MUDANÇA 2: Apenas o OpenSSL é necessário. 
    # Removemos PRISMA_SCHEMA_ENGINE_BINARY para evitar conflito com o Prisma 7.
    LD_LIBRARY_PATH = "${pkgs.lib.makeLibraryPath [ pkgs.openssl ]}";
  };
}