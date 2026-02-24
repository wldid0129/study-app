This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

## TL;DR (지금 바로 실행)

Windows VS Code 터미널에서 아래 한 줄만 실행하세요.

```bash
npm run dev:work
```

실행 후 브라우저에서 `http://localhost:3000` 접속하면 됩니다.

> `npm error Missing script: "dev:work"` 가 나오면:
> 1) 먼저 최신 코드 동기화: `git fetch --all && git checkout work && git pull origin work`
> 2) 스크립트 목록 확인: `npm run` (여기에 `dev:work` 또는 `devwork`가 보여야 함)
> 3) 당장 실행은 `npm run dev` 로 가능

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.


## 코드가 안 바뀌어 보일 때 (가장 중요한 2개 명령)

VS Code 터미널에서 아래 2개를 먼저 실행하세요.

```bash
npm run where:code
npm run publish:work
```

- `where:code`는 "내 로컬이 어떤 커밋인지" 보여줍니다.
- `publish:work`는 "지금 로컬 커밋을 origin/work로 실제 업로드"합니다.
- 이걸 안 하면 로컬에서만 바뀌고 GitHub에는 17일 커밋으로 보일 수 있습니다.


## 원하는 작업 흐름 (수정 -> 동기화 -> 로컬확인 -> 배포 -> Vercel)

아래 순서대로만 하면 됩니다.

1. **내가 코드 수정 후 원격 반영 준비**

```bash
npm run flow:sync
```

2. **VS Code에서 로컬 확인**
- 브라우저 `http://localhost:3000` 확인
- 수정 더 필요하면 코드 수정 후 다시 `npm run flow:sync`

3. **최종 커밋 + work 반영**

```bash
npm run flow:publish -- "feat: your message"
```

4. **main 반영 + Vercel 배포**

```bash
npm run flow:deploy
```

> `flow:deploy`는 `main`으로 merge/push 후 `vercel --prod`를 실행합니다.
> (Vercel CLI 로그인/프로젝트 연결이 되어 있어야 합니다.)

## Git sync (for this repo workflow)

If your local app does not reflect the latest changes, your branch may be tracking the wrong upstream.

1. Check current branch + upstream:

```bash
git branch -vv
```

2. Sync `main` from GitHub:

```bash
git checkout main
git pull origin main
```

3. Sync `work` from GitHub and set upstream (one-time if needed):

```bash
git checkout work
git branch --set-upstream-to=origin/work work
git pull
```

4. Start local app:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).


### One-click in VS Code (for Windows)

If you want "just one click" in VS Code:

1. Open Command Palette (`Ctrl+Shift+P`)
2. Run `Tasks: Run Task`
3. Choose **Study App: Sync work + Dev**

> If you do **not** see `Study App: Sync work + Dev` in task list:
> - Open the project as a **folder root** (`study-app`) in VS Code, not a single file.
> - Run `Developer: Reload Window` once.
> - Ensure workspace is trusted (`Manage Workspace Trust`).
> - As fallback, run `npm run dev:work` in terminal.

This task runs `scripts/dev-sync-work.bat`, which does:
- `git fetch --all`
- `git checkout work`
- `git branch --set-upstream-to=origin/work work`
- `git pull --ff-only`
- `npm install`
- `npm run dev`

If `origin/work` does not exist yet:

```bash
git checkout -b work
git push -u origin work
```


### If both `main` and `work` are stuck on an old commit (e.g. "17th")

This means remote branches are not updated yet. `git pull` cannot download commits that are not on GitHub.

1. Verify remote branch commits directly:

```bash
git fetch --all
git log --oneline --decorate origin/main -n 5
git log --oneline --decorate origin/work -n 5
```

2. If both are still old, merge the latest PR into `work` or `main` on GitHub first.

3. After merge, force your local branch to remote:

```bash
git checkout work
git reset --hard origin/work
```

4. Windows cache clean + rerun dev server:

```bat
rmdir /s /q .next
npm run dev
```

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
