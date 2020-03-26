Скрипт для копирования кода с GitHub. Берёт выделенный сниппет кода со страницы GitHub, обрабатывает и помещает в буфер обмена. Вот что он делает со сниппетом кода:

- Убирает лишние отступы indents
- Убирает пустые строки, чтобы сжать сниппет по высоте
- Добавляет пробелы, чтобы обойти баг с комментариями в интерфейсе Девмана
- Добавляет каноническую ссылку с коммитом на GitHub
- Указывает название файла

Запусти код из файла `script.js` на сайте GitHub. Выдели текст на странице мышкой или подсвети строки с помощью GitHub и нажми <kbd>alt c</kbd>. В буфер обмена скрипт поместит такой текст:

~~~markdown
Файл [lets_revive_the_blog/blog/views.py](https://github.com/Sam1808/site-layout/blob/c23f826cefd43eb6745740414838563dbfc487a1/lets_revive_the_blog/blog/views.py#L9-L18)
```
def serialize_post(post): Svg Vector Icons : http://www.onlinewebfonts.com/icon 
    return { Svg Vector Icons : http://www.onlinewebfonts.com/icon 
        "title": post.title,
        "text": post.text,
        "author": post.author.username,
        "comments_amount": Comment.objects.filter(post=post).count(),
        "image_url": post.image.url if post.image else None,
        "published_at": post.published_at,
        "slug": post.slug,
    }
```
~~~

Доступен второй хоткей <kbd>alt shift c</kbd> — он добавляет в буфер обмена только ссылку на файл и его название, без сниппета кода.