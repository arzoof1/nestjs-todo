#!/bin/sh

# Wait for Elasticsearch to be available
echo "Waiting for Elasticsearch to be ready..."
until curl -s "http://elasticsearch:9200" > /dev/null; do
    sleep 5
done

echo "Elasticsearch is up. Setting passwords..."

# Wait a bit more to ensure all services are ready
sleep 10

# Set kibana_system user password
echo "Setting kibana_system user password..."
curl -X POST -u "elastic:${ELASTIC_PASSWORD}" -H 'Content-Type: application/json' \
    "http://elasticsearch:9200/_security/user/kibana_system/_password" \
    -d "{\"password\":\"${KIBANA_PASSWORD}\"}"

# Check if the password was set correctly
echo "Verifying kibana_system user..."
if curl -s -I -u "kibana_system:${KIBANA_PASSWORD}" "http://elasticsearch:9200/" | grep -q "200 OK"; then
    echo "Successfully set kibana_system password"
else
    echo "Failed to set kibana_system password"
fi

# Create fleet setup user with required permissions
echo "Creating fleet_setup user..."
curl -X POST -u "elastic:${ELASTIC_PASSWORD}" -H 'Content-Type: application/json' \
    "http://elasticsearch:9200/_security/user/fleet_setup" \
    -d "{\"password\":\"${KIBANA_PASSWORD}\",\"roles\":[\"superuser\"],\"full_name\":\"Fleet Setup User\"}"

# Create Kibana role with proper permissions
echo "Creating kibana_admin role..."
curl -X POST -u "elastic:${ELASTIC_PASSWORD}" -H 'Content-Type: application/json' \
    "http://elasticsearch:9200/_security/role/kibana_admin" \
    -d '{
        "cluster": ["monitor", "manage_index_templates", "manage_ilm", "monitor_watcher", "read_ccr"],
        "indices": [
            {
                "names": [".kibana*", ".reporting*", ".apm-*", ".fleet*"],
                "privileges": ["all"]
            }
        ]
    }'

# Create Kibana admin user
echo "Creating kibana_admin user..."
curl -X POST -u "elastic:${ELASTIC_PASSWORD}" -H 'Content-Type: application/json' \
    "http://elasticsearch:9200/_security/user/kibana_admin" \
    -d "{\"password\":\"${KIBANA_PASSWORD}\",\"roles\":[\"kibana_admin\"],\"full_name\":\"Kibana Admin User\"}"

# Create indices needed for Fleet
echo "Creating Fleet indices..."
curl -X PUT -u "elastic:${ELASTIC_PASSWORD}" -H 'Content-Type: application/json' \
    "http://elasticsearch:9200/.fleet-agents" \
    -d '{"settings":{"number_of_shards":1,"number_of_replicas":0}}'

curl -X PUT -u "elastic:${ELASTIC_PASSWORD}" -H 'Content-Type: application/json' \
    "http://elasticsearch:9200/.fleet-servers" \
    -d '{"settings":{"number_of_shards":1,"number_of_replicas":0}}'

# Create .kibana index if it doesn't exist
echo "Creating .kibana index if needed..."
curl -X PUT -u "elastic:${ELASTIC_PASSWORD}" -H 'Content-Type: application/json' \
    "http://elasticsearch:9200/.kibana_1" \
    -d '{"settings":{"number_of_shards":1,"number_of_replicas":0}}' || true

# Final verification
echo "Verifying Elasticsearch setup..."
curl -u "elastic:${ELASTIC_PASSWORD}" "http://elasticsearch:9200/_cat/indices?v"

echo "Setup completed successfully!" 