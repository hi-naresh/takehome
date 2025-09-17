#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if a file exists
check_env_file() {
    local env_path=$1
    local service_name=$2
    
    if [ ! -f "$env_path" ]; then
        print_error "Environment file not found for $service_name: $env_path"
        print_warning "Please create the environment file first before running the application."
        print_status "You can copy from .env.example if available."
        return 1
    else
        print_success "Environment file found for $service_name: $env_path"
        return 0
    fi
}

# Function to install dependencies
install_dependencies() {
    local service_dir=$1
    local service_name=$2
    
    print_status "Installing dependencies for $service_name..."
    
    if [ -d "$service_dir/node_modules" ]; then
        print_warning "node_modules already exists for $service_name. Skipping installation."
        return 0
    fi
    
    cd "$service_dir" || exit 1
    
    if [ -f "package-lock.json" ]; then
        print_status "Using npm to install dependencies..."
        npm install
    elif [ -f "yarn.lock" ]; then
        print_status "Using yarn to install dependencies..."
        yarn install
    elif [ -f "pnpm-lock.yaml" ]; then
        print_status "Using pnpm to install dependencies..."
        pnpm install
    else
        print_status "No lock file found, using npm..."
        npm install
    fi
    
    if [ $? -eq 0 ]; then
        print_success "Dependencies installed successfully for $service_name"
    else
        print_error "Failed to install dependencies for $service_name"
        exit 1
    fi
    
    cd - > /dev/null || exit 1
}

# Function to run service in new terminal
run_in_terminal() {
    local service_dir=$1
    local service_name=$2
    local command=$3
    local port=$4
    
    print_status "Starting $service_name on port $port..."
    
    # Check if we're on macOS (for Terminal.app)
    if [[ "$OSTYPE" == "darwin"* ]]; then
        osascript -e "tell application \"Terminal\" to do script \"cd '$service_dir' && echo 'Starting $service_name...' && $command\""
        print_success "$service_name started in new Terminal window"
    # Check if we're on Linux (for gnome-terminal, xterm, etc.)
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        if command -v gnome-terminal &> /dev/null; then
            gnome-terminal --tab --title="$service_name" -- bash -c "cd '$service_dir' && echo 'Starting $service_name...' && $command; exec bash"
        elif command -v xterm &> /dev/null; then
            xterm -title "$service_name" -e "cd '$service_dir' && echo 'Starting $service_name...' && $command; exec bash" &
        else
            print_warning "No supported terminal found. Please start $service_name manually with: cd $service_dir && $command"
            return 1
        fi
        print_success "$service_name started in new terminal"
    else
        print_warning "Unsupported operating system. Please start $service_name manually with: cd $service_dir && $command"
        return 1
    fi
    
    sleep 2  # Give the terminal time to start
}

# Main script
main() {
    print_status "🚀 Starting quick start script for House UK Takehome Project"
    echo ""
    
    # Get the script directory (project root)
    SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
    BACKEND_DIR="$SCRIPT_DIR/backend"
    FRONTEND_DIR="$SCRIPT_DIR/frontend"
    
    # Check if directories exist
    if [ ! -d "$BACKEND_DIR" ]; then
        print_error "Backend directory not found: $BACKEND_DIR"
        exit 1
    fi
    
    if [ ! -d "$FRONTEND_DIR" ]; then
        print_error "Frontend directory not found: $FRONTEND_DIR"
        exit 1
    fi
    
    print_success "Project directories found"
    echo ""
    
    # Check environment files
    print_status "Checking environment files..."
    
    BACKEND_ENV_CHECK=false
    FRONTEND_ENV_CHECK=false
    
    # Check backend .env file
    if check_env_file "$BACKEND_DIR/.env" "Backend"; then
        BACKEND_ENV_CHECK=true
    fi
    
    # Check frontend .env file (including .env.local)
    if check_env_file "$FRONTEND_DIR/.env" "Frontend" || check_env_file "$FRONTEND_DIR/.env.local" "Frontend"; then
        FRONTEND_ENV_CHECK=true
    fi
    
    echo ""
    
    # Exit if environment files are missing
    if [ "$BACKEND_ENV_CHECK" = false ] || [ "$FRONTEND_ENV_CHECK" = false ]; then
        print_error "Cannot proceed without environment files. Please set them up first."
        print_status "Backend env file location: $BACKEND_DIR/.env"
        print_status "Frontend env file location: $FRONTEND_DIR/.env or $FRONTEND_DIR/.env.local"
        exit 1
    fi
    
    print_success "All environment files found ✅"
    echo ""
    
    # Install dependencies
    print_status "Installing dependencies..."
    echo ""
    
    install_dependencies "$BACKEND_DIR" "Backend"
    echo ""
    install_dependencies "$FRONTEND_DIR" "Frontend"
    echo ""
    
    print_success "All dependencies installed ✅"
    echo ""
    
    # Start services
    print_status "Starting services..."
    echo ""
    
    # Start backend
    run_in_terminal "$BACKEND_DIR" "Backend (NestJS)" "npm run start:dev" "3000"
    
    # Wait a bit before starting frontend
    sleep 3
    
    # Start frontend
    run_in_terminal "$FRONTEND_DIR" "Frontend (Next.js)" "npm run dev" "3001"
    
    echo ""
    print_success "🎉 All services started successfully!"
    echo ""
    print_status "📋 Service URLs:"
    print_status "   Backend API: http://localhost:3000"
    print_status "   Frontend App: http://localhost:3001"
    print_status "   Backend Swagger: http://localhost:3000/api"
    echo ""
    print_status "💡 Tips:"
    print_status "   - Check the terminal windows for logs and any errors"
    print_status "   - Use Ctrl+C in each terminal to stop the services"
    print_status "   - Make sure your environment files have the correct configuration"
    echo ""
}

# Run main function
main "$@"
