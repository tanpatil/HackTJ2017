from .utils import PassiveTrigger, StringArg, StringResult

import tweepy
import asyncio
import functools

TWITTER_CONS_KEY = "c1CPtef4WBVktQAdIUZDyD0Tq"
TWITTER_CONS_SECRET = "JKc9hGRWB3YmE05nXc6U2R8VMLRZCb2lsjKZl9jzyxlEGI98Hj"


class NewTweet(PassiveTrigger):
    _name = "NewTreet"
    _description = "New Tweet Posted"
    _args = [StringArg("handle")]
    _resultargs = [StringResult("handle"), StringResult("body"), StringResult("date")]

    async def run_init(self, handle):
        self.handle = handle

        self.api = tweepy.API(tweepy.AppAuthHandler(TWITTER_CONS_KEY, TWITTER_CONS_SECRET))
        self.last_seen = None

    async def run_call(self):
        timeline = await self.loop.run_in_executor(None, functools.partial(self.api.user_timeline, screen_name=self.handle, count=100, include_rts=True)) 

        first_id = self.last_seen

        if len(timeline) == 0:
            self.add_result(False)
        elif timeline[0].id == self.last_seen:
            self.add_result(False)
        else:
            first_id = timeline[0].id

        for entry in timeline:
            if entry.id == self.last_seen:
                break

            self.add_result(True, handle=entry.author, body=entry.text, date=entry.created_at) 

        self.last_seen = first_id

        await asyncio.sleep(10)
        self.loop.create_task(self.run_call())

