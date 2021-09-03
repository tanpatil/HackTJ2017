import asyncio
import ast


class Trigger:
    pass

class PassiveTrigger(Trigger):
    _results = asyncio.Queue()
    next_ = None
    block_id = None

    def __init__(self):
        self.loop = asyncio.get_event_loop()

    def add_result(self, condition, **kwargs):
        self._results.put_nowait((condition, kwargs))

    async def init(self, *args):
        real_args = []
        for a in args:
            real_args.append(a.value)

        return await self.run_init(*real_args)

    async def call(self, context):
        return await self.run_call()

class Result:
    pass

class StringResult(Result):
    def __init__(self, name):
        self.name = name

class Arg:
    pass

class StringArg(Arg):
    def __init__(self, name, value=None):
        self.value = value
        self.name = name

def parse_trigger_args(args):
    l = []
    p = ast.literal_eval(args)
    for ele in p:
        if ele[2] == 'string':
            l.append(StringArg(ele[1], ele[0]))

    return l

def parse_trigger_results(results):
    l = []
    print(results)
    p = ast.literal_eval(results)
    for ele in p:
        if ele[1] == 'string':
            l.append(StringArg(ele[0]))
    
    return l

