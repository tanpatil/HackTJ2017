import asyncio
import ast


class EventBlock:
    next_ = None
    block_id = None
    def __init__(self):
        self.loop = asyncio.get_event_loop()

    async def call(self, context):
        real_args = {}
        print(context)
        for a in self.args:
            print(a.value)
            real_args[a.name] = a.value.format(**context)

        return await self.run_call(**real_args)

class Arg:
    pass

class StringArg(Arg):
    def __init__(self, name, value=None):
        self.value = value
        self.name = name

def parse_event_args(args):
    l = []
    p = ast.literal_eval(args)
    for ele in p:
        if ele[2] == 'string':
            l.append(StringArg(ele[1], ele[0]))

    return l

