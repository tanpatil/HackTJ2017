from .utils import Event

import asyncio


class SendEmail(Event):
    async def call(
