from .utils import PassiveTrigger, StringArg, StringResult

import requests
import feedparser
import asyncio


class RSSTrigger(PassiveTrigger):
    _name = "RSS"
    _description = "New RSS entry"
    _args = [StringArg("url")]
    _resultargs = [StringResult("title"), StringResult("text"), StringResult("url")]
    
    stored_id = None

    async def get_content(self):
        content = await self.loop.run_in_executor(None, requests.get, self.url)
        d = feedparser.parse(content.text)

        return d

    async def run_init(self, url):
        self.url = url

        d = await self.get_content()

        if len(d.entries) > 0:
            self.stored_id = d.entries[0].id

    async def run_call(self):
        d = await self.get_content()
        first_id = self.stored_id

        if len(d.entries) == 0:
            self.add_result(False)
        elif d.entries[0].id == self.stored_id:
            self.add_result(False)
        else:
            first_id = d.entries[0].id

        for entry in d.entries:
            if entry.id == self.stored_id:
                break

            print(entry)
            self.add_result(True, title=entry.title, text=entry.description, url=entry.link)

        self.stored_id = first_id

        await asyncio.sleep(10)
        self.loop.create_task(self.run_call())

