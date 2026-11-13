@echo off
chcp 65001 >nul
setlocal EnableDelayedExpansion
cd /d "%~dp0"

rem LIMITATION: this script cannot guard uploads performed manually through the GitHub web interface.
rem Dry-run: ECHO_DRY_RUN=1 is local-fixture-only and never commits, pushes, or uses a real remote.
rem Optional test overrides: ECHO_ALLOW_DIRTY=1, ECHO_DRY_BRANCH_OK=1, ECHO_SIMULATE_UNCHANGED=1, ECHO_DRY_SKIP_DELAY=1.

set "DRY_RUN=%ECHO_DRY_RUN%"
set "VERIFY_BASE=%ECHO_VERIFY_BASE%"
if not defined VERIFY_BASE set "VERIFY_BASE=https://iterevsky.github.io/echo"
if "%DRY_RUN%"=="1" if not defined ECHO_VERIFY_BASE set "VERIFY_BASE=http://127.0.0.1:8734"
set "PUB=main"
set "PUSHED="

if "%DRY_RUN%"=="1" (
    pwsh -NoProfile -EncodedCommand JAB1AD0AWwB1AHIAaQBdACQAZQBuAHYAOgBWAEUAUgBJAEYAWQBfAEIAQQBTAEUAOwAgAGkAZgAgACgAJAB1AC4ASABvAHMAdAAgAC0AbgBvAHQAaQBuACAAQAAoACcAMQAyADcALgAwAC4AMAAuADEAJwAsACcAbABvAGMAYQBsAGgAbwBzAHQAJwAsACcAOgA6ADEAJwApACkAIAB7ACAAZQB4AGkAdAAgADEAIAB9AA==
    if errorlevel 1 (
        echo ОШИБКА: dry-run verification URL must be loopback-only: !VERIFY_BASE!
        goto :fail
    )
    echo DRY-RUN: only local fixture verification is allowed; no commit/push/deploy.
)

if "%DRY_RUN%"=="1" if "%ECHO_SIMULATE_UNCHANGED%"=="1" (
    echo WARNING: no local changes and no unpushed commits; repeat push has nothing new to publish.
    goto :done
)

echo === ЭХО: публикация изменений ===
echo.

git rev-parse --is-inside-work-tree >nul 2>&1
if errorlevel 1 (
    echo ОШИБКА: эта папка — не git-репозиторий.
    goto :fail
)

if not "%DRY_RUN%"=="1" (
    git remote get-url origin >nul 2>&1
    if errorlevel 1 (
        echo ОШИБКА: не настроен remote 'origin'.
        goto :fail
    )
) else (
    echo Guard: origin presence simulated by local fixture; no remote contacted.
)

for /f "delims=" %%b in ('git branch --show-current') do set "BRANCH=%%b"
if "%BRANCH%"=="" (
    echo ОШИБКА: HEAD отделён от ветки. Сначала вернись на ветку: git switch main
    goto :fail
)
echo Текущая ветка: %BRANCH%

if /i not "%BRANCH%"=="%PUB%" (
    if "%DRY_RUN%"=="1" if defined ECHO_DRY_BRANCH_OK (
        echo DRY-RUN: wrong-branch guard bypassed for local fixture.
    ) else (
        echo.
        echo ОШИБКА: publish branch is %PUB%, active branch is %BRANCH%.
        echo Switch to %PUB% first.
        if "%DRY_RUN%"=="1" echo Or set ECHO_DRY_BRANCH_OK=1 only for this dry-run.
        goto :fail
    )
)

set "HAS_UPSTREAM="
if not "%DRY_RUN%"=="1" (
    git rev-parse --abbrev-ref "@{u}" >nul 2>&1
    if not errorlevel 1 set "HAS_UPSTREAM=1"
) else (
    set "HAS_UPSTREAM=1"
)

set "UNPUSHED="
if not "%DRY_RUN%"=="1" if defined HAS_UPSTREAM (
    for /f %%c in ('git rev-list --count "@{u}..HEAD" 2^>nul') do set "UNPUSHED=%%c"
) else (
    set "UNPUSHED=0"
)

set "DIRTY="
git status --porcelain > "%TEMP%\echo-status.txt"
findstr /c:"." "%TEMP%\echo-status.txt" >nul
if not errorlevel 1 set "DIRTY=1"
if not defined DIRTY (
    if defined HAS_UPSTREAM (
        if "!UNPUSHED!"=="0" (
            echo WARNING: repeat push — no local changes or unpushed commits.
            goto :done
        )
        echo Local changes absent; !UNPUSHED! unpushed commits remain.
    ) else (
        echo Local changes absent; origin is not linked yet — first push.
    )
)

if defined DIRTY if not "%DRY_RUN%"=="1" (
    echo.
    echo ОШИБКА: working tree is dirty. Commit or stash your work before publishing.
    echo Files changed:
    git status --short
    goto :fail
)
if defined DIRTY if "%DRY_RUN%"=="1" if not defined ECHO_ALLOW_DIRTY (
    echo.
    echo ОШИБКА: dry-run reports a dirty working tree; real publish would stop here.
    echo Use ECHO_ALLOW_DIRTY=1 only for the simulated version bump scenario.
    goto :fail
)

echo.
echo Проверки перед публикацией...

where node >nul 2>&1
if errorlevel 1 (
    echo.
    echo ОШИБКА: Node.js не найден. Установи Node.js ^(https://nodejs.org^) —
    echo без node --check публикация невозможна. Такова политика проекта.
    goto :fail
)
for %%j in (script.js sw.js version.js chapters.js) do (
    node --check "%%j" >nul 2>&1
    if errorlevel 1 (
        echo.
        echo ОШИБКА СИНТАКСИСА в %%j:
        node --check "%%j"
        goto :fail
    )
)
echo node --check: script.js, sw.js, version.js и chapters.js — синтаксис в порядке.

set "BASEREF=HEAD"
if defined HAS_UPSTREAM set "BASEREF=@{u}"
pwsh -NoProfile -File "tests\run-static.ps1" -BaseRef "%BASEREF%"
if errorlevel 1 (
    echo.
    echo Проверки НЕ пройдены. Исправь ошибки и повтори публикацию.
    goto :fail
)

set "NEXT_NUM="
for /f "delims=" %%v in ('pwsh -NoProfile -EncodedCommand "JABzAD0AWwBJAE8ALgBGAGkAbABlAF0AOgA6AFIAZQBhAGQAQQBsAGwAVABlAHgAdAAoACcAdgBlAHIAcwBpAG8AbgAuAGoAcwAnACkAOwAgACQAbQA9AFsAcgBlAGcAZQB4AF0AOgA6AE0AYQB0AGMAaAAoACQAcwAsACAAJwB2AGEAcgAgAEUAQwBIAE8AXwBWAEUAUgBTAEkATwBOAFsAIAAJAF0AKgA9AFsAIAAJAF0AKgAnACcAKAB2AFsAMAAtADkAXQArACkAJwAnACcAKQA7ACAAaQBmACAAKAAtAG4AbwB0ACAAJABtAC4AUwB1AGMAYwBlAHMAcwApACAAewAgAGUAeABpAHQAIAAxACAAfQA7ACAAWwBpAG4AdABdACQAbQAuAEcAcgBvAHUAcABzAFsAMQBdAC4AVgBhAGwAdQBlAC4AUwB1AGIAcwB0AHIAaQBuAGcAKAAxACkAKwAxAA=="') do set "NEXT_NUM=%%v"
if not defined NEXT_NUM (
    echo ОШИБКА: version.js does not contain a numeric ECHO_VERSION.
    goto :fail
)
set "VERSION=v%NEXT_NUM%"
set "OLD_VERSION="
for /f "delims=" %%v in ('pwsh -NoProfile -EncodedCommand "JABzAD0AWwBJAE8ALgBGAGkAbABlAF0AOgA6AFIAZQBhAGQAQQBsAGwAVABlAHgAdAAoACcAdgBlAHIAcwBpAG8AbgAuAGoAcwAnACkAOwAgACQAbQA9AFsAcgBlAGcAZQB4AF0AOgA6AE0AYQB0AGMAaAAoACQAcwAsACAAJwB2AGEAcgAgAEUAQwBIAE8AXwBWAEUAUgBTAEkATwBOAFsAIAAJAF0AKgA9AFsAIAAJAF0AKgAnACcAKAB2AFsAMAAtADkAXQArACkAJwAnACcAKQA7ACAAaQBmACAAKAAtAG4AbwB0ACAAJABtAC4AUwB1AGMAYwBlAHMAcwApACAAewAgAGUAeABpAHQAIAAxACAAfQA7ACAAJABtAC4ARwByAG8AdQBwAHMAWwAxAF0ALgBWAGEAbAB1AGUA"') do set "OLD_VERSION=%%v"
if not defined OLD_VERSION (
    echo ОШИБКА: version.js does not contain a numeric ECHO_VERSION.
    goto :fail
)

if not "%DRY_RUN%"=="1" (
    pwsh -NoProfile -EncodedCommand JABwAD0AJwB2AGUAcgBzAGkAbwBuAC4AagBzACcAOwAgACQAcwA9AFsASQBPAC4ARgBpAGwAZQBdADoAOgBSAGUAYQBkAEEAbABsAFQAZQB4AHQAKAAkAHAAKQA7ACAAJABzAD0AWwByAGUAZwBlAHgAXQA6ADoAUgBlAHAAbABhAGMAZQAoACQAcwAsACAAJwB2AGEAcgAgAEUAQwBIAE8AXwBWAEUAUgBTAEkATwBOAFsAIAAJAF0AKgA9AFsAIAAJAF0AKgAnACcAdgBbADAALQA5AF0AKwAnACcAJwAsACAAJwB2AGEAcgAgAEUAQwBIAE8AXwBWAEUAUgBTAEkATwBOACAAPQAgACcAJwAnACsAJABlAG4AdgA6AFYARQBSAFMASQBPAE4AKwAnACcAJwAnACkAOwAgAFsASQBPAC4ARgBpAGwAZQBdADoAOgBXAHIAaQB0AGUAQQBsAGwAVABlAHgAdAAoACQAcAAsACAAJABzACwAIABbAFQAZQB4AHQALgBVAFQARgA4AEUAbgBjAG8AZABpAG4AZwBdADoAOgBuAGUAdwAoACQAZgBhAGwAcwBlACkAKQA=
    if errorlevel 1 goto :fail
)
echo Version: %OLD_VERSION% -^> %VERSION%

if not "%DRY_RUN%"=="1" (
    echo.
    set /p "MSG=Сообщение коммита [Обновление сайта]: "
    if "!MSG!"=="" set "MSG=Обновление сайта"
    echo.
    echo Будет выполнено:
    echo   git add -A
    echo   git commit -m "!MSG!"
    echo   git pull --rebase + git push  ^(ветка %BRANCH%^)
    set /p "CONFIRM=Опубликовать? (y/N): "
    if /i not "!CONFIRM!"=="y" goto :abort

    git add -A
    if errorlevel 1 goto :fail
    git commit -m "!MSG!"
    if errorlevel 1 goto :fail
    goto :push
) else (
    echo DRY-RUN: version bump simulated only; version.js was not changed.
    goto :verify
)

:push
if not "%DRY_RUN%"=="1" (
    if defined HAS_UPSTREAM (
        git pull --rebase
        if errorlevel 1 (
            echo.
            echo КОНФЛИКТ при rebase. Локальная работа не потеряна.
            echo Разреши конфликты в редакторе, затем выполни вручную:
            echo   git add -A
            echo   git rebase --continue
            echo   git push
            echo Отменить rebase полностью: git rebase --abort
            goto :fail
        )
        git push
        if errorlevel 1 (
            echo.
            echo ОШИБКА push. Попробуй вручную: git push
            goto :fail
        )
    ) else (
        git push -u origin %BRANCH%
        if errorlevel 1 (
            echo.
            echo ОШИБКА push. Проверь доступ к репозиторию и повтори: git push -u origin %BRANCH%
            goto :fail
        )
    )
    set "PUSHED=1"
)

:verify
if not "%ECHO_DRY_SKIP_DELAY%"=="1" (
    echo Waiting 30 seconds before cache-bypassed verification...
    timeout /t 30 /nobreak >nul
)

for %%f in (version.js index.html sw.js) do (
    set "URL=!VERIFY_BASE!/%%f?ts=!RANDOM!!RANDOM!"
    set "FILE=%%f"
    set "REMOTE_VERSION="
    set "REMOTE_HASH="
    for /f "tokens=1,2 delims=|" %%a in ('pwsh -NoProfile -EncodedCommand "JABFAHIAcgBvAHIAQQBjAHQAaQBvAG4AUAByAGUAZgBlAHIAZQBuAGMAZQA9ACcAUwB0AG8AcAAnADsAJABQAHIAbwBnAHIAZQBzAHMAUAByAGUAZgBlAHIAZQBuAGMAZQA9ACcAUwBpAGwAZQBuAHQAbAB5AEMAbwBuAHQAaQBuAHUAZQAnADsAJAByAD0AaQB3AHIAIAAtAFUAcwBlAEIAYQBzAGkAYwBQAGEAcgBzAGkAbgBnACAALQBVAHIAaQAgACQAZQBuAHYAOgBVAFIATAAgAC0AVABpAG0AZQBvAHUAdABTAGUAYwAgADIAMAA7ACQAYgA9ACQAcgAuAFIAYQB3AEMAbwBuAHQAZQBuAHQAUwB0AHIAZQBhAG0ALgBUAG8AQQByAHIAYQB5ACgAKQA7ACQAdgA9AGkAZgAoACQAcgAuAEMAbwBuAHQAZQBuAHQAIAAtAG0AYQB0AGMAaAAgACcAdgBhAHIAIABFAEMASABPAF8AVgBFAFIAUwBJAE8ATgBbACAACQBdACoAPQBbACAACQBdACoAJwAnACgAdgBbADAALQA5AF0AKwApACcAJwAnACkAewAkAG0AYQB0AGMAaABlAHMAWwAxAF0AfQBlAGwAcwBlAHsAJwAnAH0AOwAkAGgAPQAoAFsAUwBlAGMAdQByAGkAdAB5AC4AQwByAHkAcAB0AG8AZwByAGEAcABoAHkALgBTAEgAQQAyADUANgBdADoAOgBDAHIAZQBhAHQAZQAoACkALgBDAG8AbQBwAHUAdABlAEgAYQBzAGgAKAAkAGIAKQAgAHwAIABGAG8AcgBFAGEAYwBoAC0ATwBiAGoAZQBjAHQAIAB7ACQAXwAuAFQAbwBTAHQAcgBpAG4AZwAoACcAeAAyACcAKQB9ACkAIAAtAGoAbwBpAG4AIAAnACcAOwAkAGgAKwAnAHwAJwArACQAdgA="') do (
        set "REMOTE_HASH=%%a"
        set "REMOTE_VERSION=%%b"
    )
    if not defined REMOTE_HASH (
        echo.
        echo VERIFY FAILED: could not fetch %%f from !URL!
        echo Check network/cache-bypassed URL, then retry.
        goto :fail
    )
    set "LOCAL_HASH="
    for /f "delims=" %%h in ('pwsh -NoProfile -EncodedCommand "JABFAHIAcgBvAHIAQQBjAHQAaQBvAG4AUAByAGUAZgBlAHIAZQBuAGMAZQA9ACcAUwB0AG8AcAAnADsAaQBmACgAJABlAG4AdgA6AEQAUgBZAF8AUgBVAE4AIAAtAGUAcQAgACcAMQAnACAALQBhAG4AZAAgACQAZQBuAHYAOgBGAEkATABFACAALQBlAHEAIAAnAHYAZQByAHMAaQBvAG4ALgBqAHMAJwApAHsAJABzAD0AWwBJAE8ALgBGAGkAbABlAF0AOgA6AFIAZQBhAGQAQQBsAGwAVABlAHgAdAAoACQAZQBuAHYAOgBGAEkATABFACkAOwAkAHMAPQBbAHIAZQBnAGUAeABdADoAOgBSAGUAcABsAGEAYwBlACgAJABzACwAIAAnAHYAYQByACAARQBDAEgATwBfAFYARQBSAFMASQBPAE4AWwAgAAkAXQAqAD0AWwAgAAkAXQAqACcAJwB2AFsAMAAtADkAXQArACcAJwAnACwAIAAnAHYAYQByACAARQBDAEgATwBfAFYARQBSAFMASQBPAE4AIAA9ACAAJwAnACcAKwAkAGUAbgB2ADoAVgBFAFIAUwBJAE8ATgArACcAJwAnACcAKQA7ACQAYgA9AFsAVABlAHgAdAAuAEUAbgBjAG8AZABpAG4AZwBdADoAOgBVAFQARgA4AC4ARwBlAHQAQgB5AHQAZQBzACgAJABzACkAOwAkAGgAPQBbAFMAZQBjAHUAcgBpAHQAeQAuAEMAcgB5AHAAdABvAGcAcgBhAHAAaAB5AC4AUwBIAEEAMgA1ADYAXQA6ADoAQwByAGUAYQB0AGUAKAApAC4AQwBvAG0AcAB1AHQAZQBIAGEAcwBoACgAJABiACkAOwAoACQAaAAgAHwAIABGAG8AcgBFAGEAYwBoAC0ATwBiAGoAZQBjAHQAIAB7ACQAXwAuAFQAbwBTAHQAcgBpAG4AZwAoACcAeAAyACcAKQB9ACkAIAAtAGoAbwBpAG4AIAAnACcAfQBlAGwAcwBlAHsAKABHAGUAdAAtAEYAaQBsAGUASABhAHMAaAAgAC0AQQBsAGcAbwByAGkAdABoAG0AIABTAEgAQQAyADUANgAgACQAZQBuAHYAOgBGAEkATABFACkALgBIAGEAcwBoAC4AVABvAEwAbwB3AGUAcgAoACkAfQA="') do set "LOCAL_HASH=%%h"
    if not defined LOCAL_HASH (
        echo VERIFY FAILED: could not hash local %%f
        goto :fail
    )
    if "%%f"=="version.js" if /i not "!REMOTE_VERSION!"=="%VERSION%" (
        echo.
        echo VERIFY FAILED: version mismatch for %%f: !URL!
        echo Expected: %VERSION%, received: !REMOTE_VERSION!
        goto :fail
    )
    if /i not "!LOCAL_HASH!"=="!REMOTE_HASH!" (
        echo.
        echo VERIFY FAILED: SHA-256 mismatch for %%f: !URL!
        echo Local:  !LOCAL_HASH!
        echo Remote: !REMOTE_HASH!
        goto :fail
    )
    echo VERIFY PASS: %%f — !URL!
)

echo.
echo All post-publish checks passed: version string and SHA-256 for version.js, index.html, sw.js.
goto :done

:abort
echo.
echo Отменено, ничего не отправлено.
if "%DRY_RUN%"=="1" exit /b 1
goto :done

:fail
if not defined PUSHED if not "%DRY_RUN%"=="1" if defined OLD_VERSION (
    pwsh -NoProfile -EncodedCommand JABwAD0AJwB2AGUAcgBzAGkAbwBuAC4AagBzACcAOwAgACQAcwA9AFsASQBPAC4ARgBpAGwAZQBdADoAOgBSAGUAYQBkAEEAbABsAFQAZQB4AHQAKAAkAHAAKQA7ACAAJABzAD0AWwByAGUAZwBlAHgAXQA6ADoAUgBlAHAAbABhAGMAZQAoACQAcwAsACAAJwB2AGEAcgAgAEUAQwBIAE8AXwBWAEUAUgBTAEkATwBOAFsAIAAJAF0AKgA9AFsAIAAJAF0AKgAnACcAdgBbADAALQA5AF0AKwAnACcAJwAsACAAJwB2AGEAcgAgAEUAQwBIAE8AXwBWAEUAUgBTAEkATwBOACAAPQAgACcAJwAnACsAJABlAG4AdgA6AE8ATABEAF8AVgBFAFIAUwBJAE8ATgArACcAJwAnACcAKQA7ACAAWwBJAE8ALgBGAGkAbABlAF0AOgA6AFcAcgBpAHQAZQBBAGwAbABUAGUAeAB0ACgAJABwACwAIAAkAHMALAAgAFsAVABlAHgAdAAuAFUAVABGADgARQBuAGMAbwBkAGkAbgBnAF0AOgA6AG4AZQB3ACgAJABmAGEAbABzAGUAKQApAA==
)
echo.
echo Публикация прервана. Окно остаётся открытым — прочитай сообщение выше.
if "%DRY_RUN%"=="1" exit /b 1
pause
exit /b 1

:done
if "%DRY_RUN%"=="1" exit /b 0
echo.
pause
exit /b 0
