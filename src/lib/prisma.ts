import { PrismaClient, Prisma } from '@prisma/client';

type PrismaClientSingleton = ReturnType<typeof prismaClientSingleton>;

declare global {
    namespace globalThis {
        var prisma: PrismaClientSingleton;
    }
}

interface ContentWhereInput extends Prisma.ContentWhereInput {
    search?: string;
}
export interface ContentFindManyArgs extends Prisma.ContentFindManyArgs {
    where?: ContentWhereInput;
}

interface CreatorWhereInput extends Prisma.CreatorWhereInput {
    search?: string;
}
export interface CreatorFindManyArgs extends Prisma.CreatorFindManyArgs {
    where?: CreatorWhereInput;
}

export type SearchArgs = ContentFindManyArgs | CreatorFindManyArgs;
export type CountArgs = Omit<SearchArgs, 'select' | 'include' | 'distinct' | 'omit'>;

export const getModel = (modelName: Prisma.ModelName) => {
    const model = Prisma.dmmf.datamodel.models.find((model) => model.name === modelName);

    if (!model) {
        throw new Error(`Model ${modelName} not found in DMMF datamodel.`);
    }

    return model;
};

const switchType = (value: any, type: string) => {
    switch (type) {
        case 'DateTime':
            return {
                $dateFromString: {
                    dateString: new Date(value).toISOString(),
                },
            };
        case 'ObjectId':
            return { $oid: value };
        default:
            return value;
    }
};

export const convertOperators = (where: any, type: string): any => {
    if (Array.isArray(where)) {
        return where.map((i) => convertOperators(i, type));
    } else if (typeof where === 'object' && where !== null) {
        const converted: Record<string, any> = {};
        for (const key in where) {
            if (key === 'in') {
                converted['$in'] = convertOperators(where[key], type);
            } else if (key === 'notIn') {
                converted['$nin'] = convertOperators(where[key], type);
            } else if (key === 'contains') {
                converted['$regex'] = where[key];
                converted['$options'] = 'i';
            } else if (key === 'startsWith') {
                converted['$regex'] = `^${where[key]}`;
                converted['$options'] = 'i';
            } else if (key === 'endsWith') {
                converted['$regex'] = `${where[key]}$`;
                converted['$options'] = 'i';
            } else if (key === 'lt') {
                converted['$lt'] = where[key];
            } else if (key === 'lte') {
                converted['$lte'] = where[key];
            } else if (key === 'gt') {
                converted['$gt'] = where[key];
            } else if (key === 'gte') {
                converted['$gte'] = where[key];
            } else if (typeof where[key] === 'object') {
                converted[key] = convertOperators(where[key], type);
            } else {
                converted[key] = where[key];
            }
        }
        return converted;
    }
    return switchType(where, type);
};

export const prepareAggregate = (args: SearchArgs, model: ReturnType<typeof getModel>) => {
    const { where = {}, take, skip, orderBy } = args;

    const exprCondition: Record<string, any> = {};
    const matchCondition: Record<string, any> = {};

    if (where.search) {
        matchCondition['$text'] = { $search: `\"${where.search}\"`, $diacriticSensitive: false };
    }

    const fields = model.fields.map((field: any) => field.name);

    for (const key of Object.keys(where)) {
        const index = fields.indexOf(key);
        if (index < 0) continue;

        const field = model.fields[index];
        const fieldKey = field.dbName || field.name;
        const nativeType = field.nativeType?.[0] || field.type;
        const value = where[key as keyof CountArgs['where']] as any;

        if (nativeType === 'DateTime') {
            if (value instanceof Date || typeof value !== 'object') {
                exprCondition['$eq'] = [`$${fieldKey}`, switchType(value, nativeType)];
            } else {
                exprCondition['$and'] = exprCondition['$and'] || [];
                for (const [operator, val] of Object.entries(value)) {
                    exprCondition['$and'].push({ [`$${operator}`]: [`$${fieldKey}`, switchType(val, nativeType)] });
                }
            }

            continue;
        }

        matchCondition[fieldKey] = convertOperators(value, nativeType);
    }

    if (Object.keys(exprCondition).length > 0) {
        matchCondition.$expr = exprCondition;
    }

    const pipeline: object[] = [{ $match: matchCondition }];

    if (orderBy) {
        const sortCriteria: { [key: string]: 1 | -1 } = {};

        for (const [field, direction] of Object.entries(orderBy)) {
            sortCriteria[field] = direction === 'asc' ? 1 : -1;
        }

        pipeline.push({ $sort: sortCriteria });
    }

    if (skip) {
        pipeline.push({ $skip: skip });
    }

    if (take) {
        pipeline.push({ $limit: take });
    }

    return pipeline;
};

async function search<T, A>(this: T, args?: Prisma.Exact<A, SearchArgs>): Promise<{ data: Prisma.Result<T, A, 'findMany'>; total: number }> {
    const context = Prisma.getExtensionContext(this);
    const model = getModel(context.$name as any);
    const { where = {}, take, skip, orderBy, ...others } = (args || {}) as SearchArgs;

    // if (!where.search) {
    //     if ('search' in where) delete where.search;
    //     return (context as any).findMany({ where, take, skip, select, orderBy, include, omit });
    // }

    const pipeline = prepareAggregate(args as any, model);

    pipeline.push({ $project: { _id: 1 } });

    const result = await (context as any).aggregateRaw({ pipeline: [pipeline[0], { $facet: { totalCount: [{ $count: 'count' }], data: pipeline.slice(1) } }] });

    if (result.length > 0) {
        const { totalCount, data } = result[0];
        const total = totalCount[0]?.count || 0; // Lấy tổng số bản ghi

        if (Array.isArray(data) && data.length > 0) {
            const ids = data.map((i) => i['_id']['$oid']);
            const result = await (context as any).findMany({ where: { id: { in: ids } }, orderBy, ...others });
            return { data: result, total };
        }
    }

    return { data: [] as any, total: 0 };
}

async function _count<T, A>(this: T, args?: Prisma.Exact<A, CountArgs>) {
    const context = Prisma.getExtensionContext(this);
    const model = getModel(context.$name as any);

    const { where = {}, take, skip, orderBy, ...others } = (args || {}) as CountArgs;

    if (!where.search) {
        if ('search' in where) delete where.search;
        return (context as any).count({ where, ...others });
    }

    const pipeline = prepareAggregate(args as any, model);

    pipeline.push({ $count: 'count' });

    const result = await (context as any).aggregateRaw({ pipeline });
    return result[0].count;
}

const prismaClientSingleton = () => {
    const prisma = new PrismaClient().$extends({
        model: {
            content: { search, _count },
            creator: { search },
            comment: {
                async isLiked(commentId: string, userId?: string) {
                    return Promise.all([
                        userId
                            ? prisma.userLikeComment.findUnique({
                                  where: {
                                      userId_commentId: {
                                          userId,
                                          commentId,
                                      },
                                  },
                                  select: {
                                      id: true,
                                  },
                              })
                            : false,
                        prisma.userLikeComment.count({
                            where: {
                                commentId,
                            },
                        }),
                        prisma.reply.count({ where: { commentId } }),
                    ]);
                },
            },
            reply: {
                async isLiked(replyId: string, userId?: string) {
                    return Promise.all([
                        userId
                            ? prisma.userLikeReply.findUnique({
                                  where: {
                                      userId_replyId: {
                                          userId,
                                          replyId,
                                      },
                                  },
                                  select: {
                                      id: true,
                                  },
                              })
                            : false,
                        prisma.userLikeReply.count({
                            where: {
                                replyId,
                            },
                        }),
                    ]);
                },
            },
        },
    });

    return prisma;
};

let prisma: PrismaClientSingleton | null = null;

if (typeof window === 'undefined') {
    if (process.env.NODE_ENV === 'production') {
        prisma = prismaClientSingleton();
    } else {
        if (!global.prisma) {
            global.prisma = prismaClientSingleton();
        }

        prisma = global.prisma;
    }
}

export default prisma as PrismaClientSingleton;
