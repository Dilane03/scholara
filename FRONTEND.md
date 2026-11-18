# Guide du frontend Scholara

Ce document explique comment récupérer le dépôt, installer les dépendances et lancer l’interface frontend en local.

## 1. Prérequis

Installez les outils suivants avant de commencer :

- **Git**, pour cloner le dépôt.
- **Node.js 20.9 ou supérieur** (version LTS recommandée), requis par Next.js 16.
- **pnpm 12.3.4**, version déclarée dans `package.json` (`packageManager`). Activez-le avec Corepack si nécessaire :

```bash
corepack enable
corepack prepare pnpm@12.3.4 --activate
```

Vérifiez les versions :

```bash
git --version
node --version
pnpm --version
```

## 2. Cloner le dépôt

Dans un terminal, placez-vous dans le dossier où vous souhaitez installer le projet, puis clonez le dépôt GitHub :

```bash
git clone https://github.com/Dilane03/scholara.git
cd scholara
```

Pour travailler sur une branche particulière, récupérez les références distantes puis basculez sur la branche voulue :

```bash
git fetch origin
git switch <nom-de-branche>
```

Pour revenir à la version principale du projet :

```bash
git switch main
git pull --ff-only origin main
```

## 3. Installer les dépendances

Depuis la racine du dépôt (`scholara`), installez les paquets définis par le verrou de dépendances :

```bash
pnpm install --frozen-lockfile
```

`pnpm-lock.yaml` fixe les versions afin que les installations soient reproductibles. Si pnpm indique une incompatibilité de version, vérifiez que pnpm 12.3.4 est actif avant de réessayer.

## 4. Configurer le mode de données

Le frontend utilise des données de démonstration par défaut. Aucune variable d’environnement n’est nécessaire pour démarrer dans ce mode.

Pour rendre ce choix explicite, créez à la racine un fichier `.env.local` contenant :

```dotenv
NEXT_PUBLIC_DEMO_MODE=true
```

Le mode démo fournit les données définies dans `mocks/school.ts`. Il est prévu pour le développement de l’interface et ne constitue pas une persistance de données.

Pour connecter l’interface à une API, définissez plutôt :

```dotenv
NEXT_PUBLIC_DEMO_MODE=false
```

Dans ce mode, le client envoie ses requêtes aux routes `/api/v1/...` sur le même domaine que l’application. Configurez donc un backend qui expose ces routes et, si celui-ci est hébergé sur un domaine distinct, un proxy de développement ou une configuration de réécriture adaptée. Le dépôt frontend seul ne fournit pas ces routes d’API. Ne placez aucun secret dans une variable `NEXT_PUBLIC_*` : sa valeur est accessible dans le navigateur.

Le fichier `.env.local` est local à votre machine et ne doit pas être ajouté au dépôt.

## 5. Lancer le serveur de développement

À la racine du projet, exécutez :

```bash
pnpm dev
```

Next.js démarre généralement sur [http://localhost:3000](http://localhost:3000). Ouvrez cette adresse dans votre navigateur. Si le port 3000 est déjà utilisé, le terminal indiquera le port alternatif choisi.

Pour arrêter le serveur, revenez au terminal et utilisez `Ctrl+C`.

## 6. Vérifications utiles

Vérifier les types TypeScript :

```bash
pnpm exec tsc --noEmit
```

Construire l’application pour la production :

```bash
pnpm build
```

Lancer localement la version compilée après le build :

```bash
pnpm start
```

`pnpm start` nécessite qu’un build de production ait été effectué auparavant. Pour le travail quotidien, utilisez `pnpm dev`.

## 7. Structure utile du frontend

- `app/` : routes et mise en page Next.js (App Router).
- `components/` : composants d’interface.
- `lib/api.ts` : client de données et bascule entre mode démo et API.
- `mocks/school.ts` : données de démonstration.
- `public/` : ressources statiques servies par Next.js.

## Dépannage

- **`pnpm: command not found`** : activez Corepack (`corepack enable`) et préparez la version `12.3.4`.
- **Erreur de version Node.js** : installez Node.js 20.9 ou supérieur puis ouvrez un nouveau terminal.
- **Port déjà occupé** : utilisez l’URL et le port alternatifs affichés par `pnpm dev`, ou libérez le port concerné.
- **Échec des appels `/api/v1`** : vérifiez que `NEXT_PUBLIC_DEMO_MODE` n’est pas défini à `false` sans backend accessible. Le mode de démonstration est activé par défaut.
