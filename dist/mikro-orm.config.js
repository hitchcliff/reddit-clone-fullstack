"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const constansts_1 = require("./constansts");
const Post_1 = require("./entities/Post");
const path_1 = __importDefault(require("path"));
exports.default = {
    entities: [Post_1.Post],
    dbName: "lilredit",
    user: "postgres",
    password: "postgres",
    debug: !constansts_1.__prod__,
    type: "postgresql",
    migrations: {
        path: path_1.default.join(__dirname, "./migrations"),
        pattern: /^[\w-]+\d+\.[tj]s$/,
    },
};
//# sourceMappingURL=mikro-orm.config.js.map