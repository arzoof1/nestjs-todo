#!/bin/bash

# Start Elasticsearch in the background
/usr/local/bin/docker-entrypoint.sh elasticsearch &

# Wait for Elasticsearch to start
until curl -s http://localhost:9200 > /dev/null; do
    echo "Waiting for Elasticsearch to start..."
    sleep 5
done

echo "Elasticsearch started, setting up service accounts..."

# Wait a bit more to ensure all services are ready
sleep 10

# Create a service token for Kibana
KIBANA_TOKEN=$(curl -s -X POST -u "elastic:elastic123" -H "Content-Type: application/json" http://localhost:9200/_security/service/elastic/kibana/credential/token/kibana-token | jq -r '.token.value')

echo "Kibana service token created: $KIBANA_TOKEN"
echo "Please update the ELASTICSEARCH_SERVICEACCOUNTTOKEN value in your docker-compose.yml with this token."

# Keep Elasticsearch running in the foreground
wait 