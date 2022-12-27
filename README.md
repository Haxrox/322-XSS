# 322-XSS-Hax

Script used to steal other users' cookies using XSS on a CPEN 322 banking web application

Stole the top 3 most amount of money within the first week (got myself IP blocked + probably DoS'd the server a couple of times as well...)

Migrated to Amazon EC2 VM to continuously steal money from other users
- Decreased request rate to satisfy rate limits + not get my EC2 VM IP blocked

Hosted an obfuscated version on glitch + repl to maximize stealing rate and to protect my script from being stolen