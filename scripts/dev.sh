if ! minikube status >/dev/null 2>&1; then
  echo "Minikube is not running. Starting minikube..."
  minikube start
else
  echo "Minikube is already running."
fi

# Check if consul or app releases exist
if helm list --all-namespaces -q | grep -q "consul"; then
  echo "Consul release found. Upgrading Consul Helm chart..."
  helm upgrade consul --values ./kubernetes/consul/dev.yaml ./kubernetes/consul --dependency-update  --create-namespace --atomic --namespace consul
else
  echo "Consul release not found. Installing Consul Helm chart..."
  helm install consul --values ./kubernetes/consul/dev.yaml ./kubernetes/consul --dependency-update  --create-namespace --atomic --namespace consul
fi

if helm list --all-namespaces -q | grep -q "app"; then
  echo "App release found. Upgrading application Helm chart..."
  helm upgrade app --values ./kubernetes/app/dev.yaml ./kubernetes/app --dependency-update --create-namespace --atomic --namespace app
else
  echo "App release not found. Installing application Helm chart..."
  helm install app --values ./kubernetes/app/dev.yaml ./kubernetes/app --dependency-update --create-namespace --atomic --namespace app
fi