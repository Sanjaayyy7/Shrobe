#!/bin/bash

# Crear el archivo .env.local con las variables de Supabase
cat > .env.local << EOL
NEXT_PUBLIC_SUPABASE_URL=https://hviofamhcgqukpenyjjv.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh2aW9mYW1oY2dxdWtwZW55amp2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU2MTEwNjksImV4cCI6MjA2MTE4NzA2OX0.NA8gvvyKVlhAsdcM2f6mWCCYzTE5aD7WsTZateBNGMk
EOL

echo "Archivo .env.local creado con éxito!" 