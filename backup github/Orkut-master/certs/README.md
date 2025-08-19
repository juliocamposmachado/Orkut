# Certificados SSL

## Para Supabase

Adicione seu certificado SSL do Supabase nesta pasta:

1. Baixe o certificado do Supabase (geralmente `prod-ca-2021.crt` ou similar)
2. Coloque o arquivo nesta pasta: `certs/prod-ca-2021.crt`
3. O sistema automaticamente usará este certificado para conexões seguras

## Estrutura esperada:
```
certs/
├── README.md (este arquivo)
└── prod-ca-2021.crt (seu certificado Supabase)
```

## Nota de segurança:
- Certificados SSL são seguros para versionar no Git
- Diferente de senhas/chaves privadas, certificados CA são públicos
- O arquivo .gitignore já está configurado para não ignorar arquivos .crt nesta pasta
