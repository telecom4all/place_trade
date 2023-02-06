#!/bin/bash

app_file=$2
app_name=$3

# Function to display messages in different colors
function display_message {
  case $1 in
    "error")
      echo -e "\033[31m[ERROR]\033[0m $2"
      ;;
    "success")
      echo -e "\033[32m[SUCCESS]\033[0m $2"
      ;;
    "warning")
      echo -e "\033[33m[WARNING]\033[0m $2"
      ;;
    "info")
      echo -e "\033[36m[INFO]\033[0m $2"
      ;;
    *)
      echo -e "$2"
      ;;
  esac
}







if [ "$1" = "install" ]; then
  # Check if app is already installed
  app_installed=$(pm2 list | grep $app_name)
  if [ -z "$app_file" ]; then
    display_message error "Please provide the name of the app file"
    exit 1
  fi
  if [ -z "$app_name" ]; then
    display_message error "Please provide the name of the app"
    exit 1
  fi
  if [ -z "$app_installed" ]; then
    pm2 start $app_file --name "$app_name"
    pm2 save
    display_message success "Application $app_file installed and saved with name $app_name"
  else
    display_message error "Application $app_file already installed"
  fi
elif [ "$1" = "manage" ]; then
  
  if [ -z "$app_file" ]; then
    display_message error "Please provide the name of the app file"
    exit 1
  fi
  # Check if app is already installed
  app_installed=$(pm2 list | grep $app_file)
  if [ -z "$app_installed" ]; then
    display_message error "Application $app_file not found. Please install it first"
    exit 1
  else
    while true; do
      clear
      echo "Please choose an action for $app_file:"
      echo "1. Start in background"
      echo "2. Monitor"
      echo "3. List all processes"
      echo "4. Save processes"
      echo "5. Restart all processes"
      echo "6. delete processe"
      echo "7. Quit"
      read -p "Enter your choice [1-7]: " choice
      case $choice in
        1)
          pm2 start $app_file
          display_message success "Application $app_file started in background"
          sleep 2
          pm2 save  --force
          sleep 2
          ;;
        2)
          pm2 monit
          read -p "Press any key to continue... "
          ;;
        3)
          pm2 list
          read -p "Press any key to continue... "
          ;;
        4)
          pm2 save
          display_message success "Processes saved"
          sleep 2
          ;;
        5)
          pm2 resurrect
          display_message success "All processes restarted"
          sleep 2
          ;;
        6)
          pm2 delete $app_file
          display_message success "delete processe"
          sleep 2
          pm2 save --force
          sleep 2
          ;;
        7)
          break
          ;;
        *)
          display_message error "Invalid option. Please try again."
          sleep 2
          ;;
      esac
    done
  fi
else
  display_message error "Invalid argument. Please use either install or manage and appname"
  exit 1
fi
