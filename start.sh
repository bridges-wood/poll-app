# Check that docker daemon is running
if ! curl -s --unix-socket /var/run/docker.sock http/_ping 2>&1 >/dev/null
then
  open /Applications/Docker.app
  # Wait until the server is running
  while ! curl -s --unix-socket /var/run/docker.sock http/_ping 2>&1 >/dev/null
  do
    echo "Waiting for Docker to launch..."
    sleep 1
  done
fi

# Create minikube cluster
minikube start

# Connect to the cluster
echo "Connecting to the cluster..."
kubectl cluster-info

# Deploy Consul
echo "🚀 Deploying consul..."
helm install --values config/helm/values-v1.yaml consul hashicorp/consul --create-namespace --namespace consul --version "1.2.0"

# Expose the Consul UI
export CONSUL_HTTP_TOKEN=$(kubectl get --namespace consul secrets/consul-bootstrap-acl-token --template={{.data.token}} | base64 -d)
export CONSUL_HTTP_ADDR=https://127.0.0.1:8501
export CONSUL_HTTP_SSL_VERIFY=false
# Echo the Consul HTTP token
printf "\n\nYour Consul HTTP token is: $CONSUL_HTTP_TOKEN\n"

echo "📝 Applying the application configuration..."
kubectl apply -f config/kube

# Traverse all the applications and apply their configurations
for app in apps/*; do
  if [ -d "$app" ]; then
    echo "Applying configuration for $app..."
    kubectl apply -f "$app/kube"
  fi
done