class LoopBlock:
    pass

class ForLoop(LoopBlock):
    def __init__(self):
        self.variable = 0

    def increment(self):
        self.variable += 1

    def reset(self):
        self.variable = 0

class WhileLoop(LoopBlock):
    def __init__(self):
        self.variable = 0

    def increment(self):
        pass

    def reset(self):
        pass


def parse_loop_type(t):
    if t == 'for':
        return ForLoop()
    elif t == 'while':
        return WhileLoop()

