class ConditionBlock:
    in_val = None
    out_val = None
    check = None

    def evaluate(self, context):
        if self.check == 'in':
            return self.in_val.format(**context) in self.out_val.format(**context)
        elif self.check == 'lt':
            return self.in_val.format(**context) < self.out_val.format(**context)
        elif self.check == 'gt':
            return self.in_val.format(**context) > self.out_val.format(**context)
        elif self.check == 'gte':
            return self.in_val.format(**context) >= self.out_val.format(**context)
        elif self.check == 'lte':
            return self.in_val.format(**context) <= self.out_val.format(**context)
        elif self.check == 'eq':
            return self.in_val.format(**context) == self.out_val.format(**context)
        elif self.check == 'neq':
            return self.in_val.format(**context) != self.out_val.format(**context)

