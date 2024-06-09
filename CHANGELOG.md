# История изменений

При очередном коммите фиксируем в этом документе те изменения в работе ПО, что могут затронуть пользователей. Игнорируем изменения, затрагивающие только разработчиков ПО.

Изменения записываем кратко и ёмко. По возможности прикладываем ссылки на issues.

Новые изменения записываем в самый верх в раздел «Не в релизе». При релизе переносим накопившиеся изменения в новый раздел с номером версии и датой в названии. Дополнительно в репозитории
создаём тег с тем же номером релиза, чтобы иметь возможность быстро переключаться между релизами в истории коммитов.

Номер версии релиза состоит из трех цифр MAJOR.MINOR.PATCH, где:

- MAJOR - глобальные изменение, которые несовместимы с предыдущей версией
- MINOR - добавление функциональности, обратно совместимой с предыдущим функционалом
- PATCH - мелкие изменения, багфиксы

Изменения группируем по их типу, каждому свой подраздел:

- `Added`
- `Changed`
- `Deprecated`
- `Removed`
- `Fixed`
- `Security`

## Не в релизе

...

## [1.2.0] - 2024-06-09

- Исправлено копирование кода на GitHub через выделение строк [issue #30](https://github.com/devmanorg/github-copy-plugin/issues/30)

## [1.1] - 2024-05-08

- Исправлена работа плагина в Firefox, [issue #13](https://github.com/devmanorg/github-copy-plugin/issues/13)
- Скрыт контейнер плагина, [issue #15](https://github.com/devmanorg/github-copy-plugin/issues/15)
- Добавляет условие на выделенный текст, [issue #20](https://github.com/devmanorg/github-copy-plugin/issues/20)
- Исправлена подсветка синтаксиса в Replit, [issue #21](https://github.com/devmanorg/github-copy-plugin/issues/21)
- Исправлена инструкция для запуска в firefox, [issue #19](https://github.com/devmanorg/github-copy-plugin/issues/19)
- Добавляет определения языка при копировании кода в gitlab, [issue #16](https://github.com/devmanorg/github-copy-plugin/issues/16)
- Исправляет получение типа файла в ссылках с get параметрами, [issue #28](https://github.com/devmanorg/github-copy-plugin/issues/28)
- Исправляет копирование строк в GitHub, [issue #30](https://github.com/devmanorg/github-copy-plugin/issues/30)
