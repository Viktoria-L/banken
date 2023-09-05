# Banken 🏦 💰
## Inlämningsuppgift 2 Javascript som backendspråk
Din uppgift är att programmera en enkel “bank”, där en användare kan skapa konton, och
sätta in, ta ut.
Projektet skall bestå av ett REST-API, samt en frontend som kommunicerar med API:et via
Javascript.
API:et ska lagra information i en MongoDB.
Kommunikationen mellan API:et och frontend skall vara med JSON.

Ett konto på banken har följande egenskaper:
• Kontonummer
• Kontonamn
• Mängden pengar på kontot
Din frontend skall ha följande:
• Ett formulär för att lägga till ett nytt konto, med namn och mängd pengar.
Kontonumret skall skapas automatiskt (t.ex. Mongos ID, eller
https://www.npmjs.com/package/uuid).
• En lista på alla konton med namn, nummer och mängden pengar.
• För varje konto skall det vara möjligt att lägga till (sätta in) pengar.
• För varje konto skall det vara möjligt att ta bort (ta ut) pengar. OBS! Det skall inte gå
att ta bort mer pengar än det finns på kontot!
• Det skall gå att ta bort konton.

Banken skall vara skyddad så att man måste logga in för att använda den.
Det räcker med att alla användare kan hantera samma, alltså alla konton; men om du vill får
du göra så att varje användare har varsina konton.
Om du gör så, behöver du fundera på om du skall knyta ihop konton och användare med
referenser (https://www.mongodb.com/docs/manual/tutorial/model-referenced-one-to-manyrelationships-between-documents/), eller om du skall ha endast en collection med
användare och ha kontona som en del av användar-documentet.
Kontofunktioner:
• Det skall gå att skapa nya användare.
• Lösenord skall vara krypterade i databasen.
• Man skall kunna logga in.
• Man ska inte kunna se kontoinformation om man inte är inloggad.

Fokus var ej på layouten.

![image](https://github.com/Viktoria-L/banken/assets/113613194/3be7c4ee-f7fb-499d-a44c-d4eb89ed20fe)
