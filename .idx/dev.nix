{ pkgs, ... }: {
  # Use https://search.nixos.org/packages to find packages
  packages = [
    pkgs.nodejs_20 # For Next.js frontend and Express.js backend
    pkgs.nodePackages.pnpm # A common modern package manager
    pkgs.postgresql_16 # Your database
    pkgs.redis # For caching and sessions
    pkgs.docker # For running docker-compose
    pkgs.docker-compose # To manage your services
    pkgs.flyctl # Useful for future deployments to Fly.io
  ];

  # Sets environment variables in the workspace
  env = {};

  # Defines a list of processes that should be managed by `procman`
  processes = {};

  # Defines a set of previews that should be shown in the workspace
  previews = {
    enable = true;
    previews = {
      web = {
        # Command to start the Next.js frontend
        command = ["pnpm" "-C" "apps/web" "run" "dev" "--" "-p" "$PORT"];
        manager = "web";
      };
      backend = {
        # Command to start the Express.js backend
        command = ["pnpm" "-C" "apps/backend" "run" "dev"];
        manager = "process";
      };
    };
  };

  # Workspace lifecycle hooks
  workspace = {
    # Runs when a workspace is first created
    # Using pnpm install is generally faster.
    onCreate = {
      pnpm-install = "pnpm install";
      # Initialize the database via Docker as per your docs
      init-db = "docker-compose -f packages/docker-compose.dev.yml up -d db redis";
    };
    # Runs when the workspace is (re)started
    onStart = {
      # Ensure required services are running
      start-services = "docker-compose -f packages/docker-compose.dev.yml up -d db redis";
    };
  };
}
