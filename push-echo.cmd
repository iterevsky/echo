@echo off
chcp 65001 >nul
setlocal EnableDelayedExpansion
cd /d "%~dp0"

echo === ЭХО: публикация изменений ===
echo.

rem --- это git-репозиторий? ---
git rev-parse --is-inside-work-tree >nul 2>&1
if errorlevel 1 (
    echo ОШИБКА: эта папка — не git-репозиторий.
    goto :fail
)

rem --- есть remote? ---
git remote get-url origin >nul 2>&1
if errorlevel 1 (
    echo ОШИБКА: не настроен remote 'origin'.
    goto :fail
)

for /f "delims=" %%b in ('git branch --show-current') do set "BRANCH=%%b"
if "%BRANCH%"=="" (
    echo ОШИБКА: HEAD отделён от ветки. Сначала вернись на ветку: git switch main
    goto :fail
)
echo Текущая ветка: %BRANCH%

rem --- публикационная ветка GitHub Pages ---
set "PUB=main"
if /i not "%BRANCH%"=="%PUB%" (
    echo.
    echo ВНИМАНИЕ: сайт публикуется из ветки %PUB%, а сейчас активна %BRANCH%.
    set /p "BRANCHOK=Всё равно опубликовать ветку %BRANCH%? (y/N): "
    if /i not "!BRANCHOK!"=="y" goto :abort
)

rem --- upstream ветки ---
set "HAS_UPSTREAM="
git rev-parse --abbrev-ref "@{u}" >nul 2>&1
if not errorlevel 1 set "HAS_UPSTREAM=1"

rem --- что изменилось ---
echo.
echo Изменённые файлы:
git status --short
echo.

rem --- неотправленные коммиты ---
set "UNPUSHED="
if defined HAS_UPSTREAM (
    for /f %%c in ('git rev-list --count "@{u}..HEAD" 2^>nul') do set "UNPUSHED=%%c"
)

rem --- нет ни изменений, ни неотправленных коммитов? ---
git status --porcelain | findstr . >nul
if errorlevel 1 (
    if defined HAS_UPSTREAM (
        if "!UNPUSHED!"=="0" (
            echo Нет ни локальных изменений, ни неотправленных коммитов.
            goto :done
        )
        echo Локальных изменений нет, но есть !UNPUSHED! неотправленных коммитов.
        goto :nopushchanges
    )
    echo Локальных изменений нет; origin ещё не связан с веткой — будет первая отправка.
    goto :nopushchanges
)

rem --- структурные проверки + контроль CACHE_VERSION ---
echo.
echo Проверки перед публикацией...
set "BASEREF=HEAD"
if defined HAS_UPSTREAM set "BASEREF=@{u}"
pwsh -NoProfile -File "tests\run-static.ps1" -BaseRef "%BASEREF%"
if errorlevel 1 (
    echo.
    echo Проверки НЕ пройдены. Если менялись файлы сайта (index.html, style.css,
    echo script.js, sw.js, chapters.js, картинки, шрифты, иконки) — подними
    echo CACHE_VERSION в начале sw.js ^(echo-vNN -^> следующий номер^) и повтори.
    goto :fail
)

echo.
set /p "MSG=Сообщение коммита [Обновление сайта]: "
if "%MSG%"=="" set "MSG=Обновление сайта"

echo.
echo Будет выполнено:
echo   git add -A
echo   git commit -m "%MSG%"
echo   git pull --rebase + git push  (ветка %BRANCH%)
set /p "CONFIRM=Опубликовать? (y/N): "
if /i not "%CONFIRM%"=="y" goto :abort

git add -A
if errorlevel 1 goto :fail
git commit -m "%MSG%"
if errorlevel 1 goto :fail
goto :push

:nopushchanges
set /p "CONFIRM=Отправить на GitHub (pull --rebase + push)? (y/N): "
if /i not "%CONFIRM%"=="y" goto :abort

:push
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

echo.
echo Готово. GitHub Pages обновляет сайт не мгновенно — подожди 1-2 минуты,
echo затем проверь https://iterevsky.github.io/echo/ с обходом кэша (Ctrl+F5).
goto :done

:abort
echo.
echo Отменено, ничего не отправлено.
goto :done

:fail
echo.
echo Публикация прервана. Окно остаётся открытым — прочитай сообщение выше.
pause
exit /b 1

:done
echo.
pause
exit /b 0
