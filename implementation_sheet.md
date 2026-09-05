# Feuille d'implémentation - module Meta CAPI

## Cible

Un harness Next.js x Meta. Un seul deep module, le moteur, qui permet à n'importe quel composant
de porter une balise d'événement Meta. Le même code chez tous les partenaires, rien de
partenaire-spécifique en dur : identifiant de dataset, jeton et domaine viennent de la
configuration.

## Critères de réussite, qui sont les critères d'arrêt

La boucle ne s'arrête pas avant que les six soient tenus. Aucun n'est un objectif partiel.

1. 100% des événements Meta sont pris en charge.
2. Un seul deep module, le moteur, qui expose la manière la plus simple possible d'accrocher une
   balise sur un composant.
3. Construit comme une lib destinée à un inconnu : le README est un mode d'emploi IKEA.
4. Construit pour du SSR sur React et Next : la frontière client serveur, les rerenders, le
   montage et le démontage sont traités comme des dangers de premier plan, parce que ce sont eux
   qui produisent le double firing et le no-firing.
5. Les search params appartiennent au client, et 100% d'entre eux sont capturés.
6. La page main reste 100% serveur. `use client` ne s'y trouve jamais, il descend sur la feuille la
   plus basse.

Les critères 4, 5 et 6 sont des contraintes de conception. Aucune interface n'étant construite dans
cette boucle, ils ne se vérifient pas à l'écran : ils se tiennent dans la façon dont le module est
découpé, et se constateront le jour où une page l'utilisera.

## Règle absolue

Aucun code de production avant que la shape exacte du payload Meta ne soit établie avec certitude :
chaque clé, son type, son format, si elle est hachée, et quelle normalisation précède le hachage.
La recherche ferme en premier. Cette règle passe avant le chronomètre.

## Autonomie

Gray n'est pas disponible pendant la boucle. Aucune phase ne s'arrête pour attendre une
approbation, elle ne viendra pas. Ce qui se soumettrait normalement se décide et se consigne : une
dépendance ajoutée, un arbitrage d'architecture, du code devenu mort, tout part dans le journal des
décisions passées avec son motif en une ligne. C'est cette trace que Gray révise après coup, et
c'est elle qui remplace l'approbation, jamais un blocage.

## Environnement

- Web uniquement. Ni application mobile, ni magasin physique, ni messagerie, ni import hors ligne.
- Le module vit des deux côtés de la frontière. Ce qui est client et ce qui est serveur se nomme
  avant d'être écrit, jamais à l'exécution.
- Le jeton, la normalisation et le hachage sont serveur, sans exception.
- Les dépendances passent la règle maison : nommer le gain majeur en une phrase, sinon on écrit le
  code. Zod est pressenti pour la validation, il n'est pas acquis.
- Aucune interface utilisateur dans cette boucle. Aucune page n'est construite pour la
  démonstration : les vérifications passent par le cURL et par les tests unitaires.

## Dépôt et déploiement

- Le dépôt se crée sur `s-e-r-n`, en public, juste après le scaffold. Un dépôt privé interdit le
  déploiement Vercel.
- Le déploiement Vercel n'a lieu que si le passage en production devient nécessaire. Ce n'est pas
  un objectif de la boucle.
- Le token vient d'automic-vault côté agent, et se pose en variable d'environnement sur Vercel. Le
  code applicatif ne lit jamais le vault, il lit l'environnement.

## Décisions déjà prises

| Décision                                                                        | Motif                                                                                                                                                                                                         |
| ------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Les noms d'événements sont ceux de Meta, tels quels                             | Pas de vocabulaire maison, pas de table de traduction. C'est la shape attendue par Meta qui dicte les clés et les valeurs. Une correspondance est une deuxième source de vérité, et elle se périme en silence |
| Ce qui ne passe pas la validation client ne touche pas le serveur               | La validation est un filtre à l'entrée, pas un doublon. Le serveur reçoit une donnée déjà valide et se consacre à la normalisation et au hachage, qui n'existent que chez lui                                 |
| Server action pour les gestes utilisateur, route handler pour l'entrant externe | Un événement né d'un geste sur notre site est une mutation de notre service. Un webhook est une intégration externe                                                                                           |
| Le pixel navigateur est hors de cette boucle                                    | Il se met en place dans un deuxième temps. Rien dans cette passe ne dépend de lui                                                                                                                             |
| Le jeton d'accès ne quitte jamais le serveur                                    | Configuration uniquement, jamais un bundle, jamais un search param                                                                                                                                            |

## Orchestration

| Travail                                                  | Responsable                         |
| -------------------------------------------------------- | ----------------------------------- |
| Décisions cruciales                                      | Orchestrateur, cette session        |
| Code de production                                       | Orchestrateur                       |
| Rédaction de la compétence `working-with-meta-capi`      | Orchestrateur                       |
| Recherche dans la documentation                          | Sous-agent, modèle moins performant |
| Rédaction des trouvailles dans les fichiers de recherche | Sous-agent, modèle moins performant |

Chaque sous-agent est prévenu, dans son propre prompt : Meta publie des formats de documentation
destinés aux LLM. Il faut les trouver en premier, travailler dessus, et rapporter où ils sont.
Rien ne s'écrit de mémoire, et chaque réponse porte l'URL d'où elle vient. Une réponse sans source
n'est pas une réponse, c'est une supposition, et elle est rejetée à la phase 2.

Ce qui est déjà établi : `developers.facebook.com/llms.txt` existe et indexe Ads and Commerce ainsi
que la Marketing API, mais il ne référence ni la Conversions API ni la Dataset Quality API, qui
restent à atteindre par leurs propres pages. Il demande aussi que les agents s'identifient par un
User-Agent structuré, de la forme `AgentName/Version (ModelName) HTTPClient`, constant d'une
requête à l'autre. Cet en-tête vaut pour la recherche comme pour le cURL de la phase 5.

## Phases

Chaque phase se termine par un fichier sur disque. Ce fichier est le point de reprise : un agent
qui redémarre en cours de boucle lit les artefacts, jamais la conversation. Les durées donnent le
rythme d'une passe de 45 minutes.

| #   | Phase                                                                                                                                | Se termine par                                    | ~      |
| --- | ------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------- | ------ |
| 0   | Création du projet, `/scaffold-nextjs-app`, puis dépôt public sur `s-e-r-n`                                                          | Une application qui tourne, un dépôt distant      | 5 min  |
| 1   | Recherche, sous-agents en parallèle                                                                                                  | Les fichiers de recherche, chaque réponse sourcée | 15 min |
| 2   | Fermeture de la shape. L'orchestrateur lit la recherche et rejette ce qui n'est pas sourcé ou ce qui se contredit                    | Le SSOP et le journal des décisions passées       | 5 min  |
| 3   | Tests unitaires, écrits avant l'implémentation                                                                                       | Des tests qui échouent                            | 4 min  |
| 4   | Moteur, écrit de bas en haut dans l'ordre trié par le SSOP                                                                           | Le module                                         | 8 min  |
| 5   | Vérification de la shape en conditions réelles par cURL sur l'endpoint, réponse observée et comparée à ce que la recherche annonçait | Une requête et sa réponse, consignées             | 3 min  |
| 6   | README                                                                                                                               | Le mode d'emploi                                  | 2 min  |
| 7   | Compétence `working-with-meta-capi`                                                                                                  | SKILL.md                                          | 3 min  |

Un écart constaté à la phase 5 entre la réponse observée et la shape issue de la recherche rouvre
la phase 2. Il ne se rattrape jamais dans le code.

La compétence s'écrit en dernier, quand la shape a été confrontée au réel. Écrite plus tôt, elle
documenterait ce que la documentation annonçait, pas ce que l'API répond.

## Périmètre des tests unitaires

Un test dit si une fonction retourne la bonne valeur, et si elle reçoit et transmet le bon
argument. Il ne prétend pas que le module est prêt pour la production. Les vrais tests sont
déclenchés par Gray, pas par l'agent.

## La règle du README

README.md = mode d'emploi IKEA. Les informations essentielles à l'utilisation du module, rien
d'autre. On n'explique pas comment le recoder, ni comment il fonctionne à l'intérieur, ni ce qui
s'est passé pendant le développement.

## Recherche

La recherche est exhaustive par défaut. La liste ci-dessous ouvre des directions, elle ne les
ferme pas : toute clé, tout format, toute contrainte, toute limite trouvée dans la documentation
entre dans le rapport, y compris ce que cette liste ne nomme pas. Une liste qui borne est une
liste qui perd.

1. Tous les événements, standards et personnalisés, et pour chacun tout ce que Meta en documente.
2. La shape complète de l'événement serveur : toutes les clés, à tous les niveaux, avec leur type,
   leur format, leur caractère requis, leurs valeurs admises et leurs contraintes.
3. Tout ce qui touche à l'identité de la personne : quelles clés existent, lesquelles sont hachées,
   quelle normalisation précède le hachage, quels formats standards sont exigés.
4. Tout ce que Meta répond, dans tous les cas.
5. `test_event_code` et le flux de validation : ce qu'il route vers Test Events, ce qu'il ne couvre
   pas, et ce qu'on peut observer avant que les événements comptent pour de vrai.
6. Consentement et traitement des données pour une audience suisse et européenne.
7. Les dangers propres à React et Next : tout ce qui produit un double firing ou un no-firing.
8. Les search params : lesquels comptent, et comment ils survivent jusqu'au serveur.
9. La Dataset Quality API : d'abord son chemin réel, puisque `/{dataset}/dataset_quality` est
   refusé. Puis tout ce qu'elle rend, à quelle granularité et sur quelles fenêtres, et quelles
   permissions elle exige réellement, sachant que le jeton en place n'a pas d'accès en lecture. La
   dépense par événement en particulier, dont la page annonce l'existence : si elle tient ce
   qu'elle annonce, elle relie la dépense aux conversions sans passer par l'API Marketing.

## Fourni par Gray, non recherché

- [https://developers.facebook.com/documentation/ads-commerce/conversions-api/using-the-api ] => doc de l'API
- Un identifiant de dataset et un jeton d'accès réels, déposés dans `.env.local`. Fournis et
  vérifiés le 2026-09-05.
- Le déclenchement des vrais tests.
