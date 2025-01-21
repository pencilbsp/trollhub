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

export const convertPrismaToMongoOperators = (where: any): any => {
    if (Array.isArray(where)) {
        // Nếu là mảng, duyệt qua từng phần tử
        return where.map(convertPrismaToMongoOperators);
    } else if (typeof where === 'object' && where !== null) {
        // Nếu là object, duyệt qua từng key
        const converted: any = {};
        for (const key in where) {
            if (key === 'in') {
                converted['$in'] = convertPrismaToMongoOperators(where[key]);
            } else if (key === 'notIn') {
                converted['$nin'] = convertPrismaToMongoOperators(where[key]);
            } else if (key === 'contains') {
                converted['$regex'] = where[key];
                converted['$options'] = 'i'; // Không phân biệt chữ hoa/chữ thường
            } else if (key === 'startsWith') {
                converted['$regex'] = `^${where[key]}`;
                converted['$options'] = 'i';
            } else if (key === 'endsWith') {
                converted['$regex'] = `${where[key]}$`;
                converted['$options'] = 'i';
            } else if (key === 'lt') {
                converted['$lt'] = where[key]; // Nhỏ hơn
            } else if (key === 'lte') {
                converted['$lte'] = where[key]; // Nhỏ hơn hoặc bằng
            } else if (key === 'gt') {
                converted['$gt'] = where[key]; // Lớn hơn
            } else if (key === 'gte') {
                converted['$gte'] = where[key]; // Lớn hơn hoặc bằng
            } else if (typeof where[key] === 'object') {
                // Đệ quy nếu giá trị là một object
                converted[key] = convertPrismaToMongoOperators(where[key]);
            } else {
                // Copy các key khác không cần chuyển đổi
                converted[key] = where[key];
            }
        }
        return converted;
    }
    // Trả về giá trị nguyên bản nếu không phải object hoặc array
    return where;
};

export const prepareAggregate = (args: SearchArgs, model: ReturnType<typeof getModel>) => {
    const { where = {}, take, skip, orderBy } = args;

    const matchCondition: Record<string, any> = {};

    if (where.search) {
        matchCondition['$text'] = { $search: `\"${where.search}\"`, $diacriticSensitive: false };
    }

    const fields = model.fields.map((field: any) => field.name);

    for (const key of Object.keys(where)) {
        const index = fields.indexOf(key);
        if (index < 0) continue;

        const field = model.fields[index];
        const value = where[key as keyof CountArgs['where']];
        const nativeType = field.nativeType?.[0] || field.type;

        switch (typeof value) {
            case 'object':
                matchCondition[field.dbName || field.name] = convertPrismaToMongoOperators(value);
                break;

            case 'number':
            case 'string':
            case 'bigint':
                if (nativeType === 'String' || nativeType === 'Int') {
                    matchCondition[field.dbName || field.name] = value;
                } else if (nativeType === 'ObjectId') {
                    matchCondition[field.dbName || field.name] = { $oid: value };
                } else if (nativeType === 'DateTime') {
                    matchCondition[field.dbName || field.name] = { $oid: value };
                }
                break;

            default:
                break;
        }
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
            const result = await (context as any).findMany({ where: { id: { in: ids } }, ...others });
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
