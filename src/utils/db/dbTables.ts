import { Transaction } from 'react-native-sqlite-storage';

type Spec = {
  [k: string]: string;
};

type TableSpec = {
  columns: Spec;
  foreignKeys?: Spec;
};

export enum DBTable {
  version = 'version',
  book = 'book',
  chapter = 'chapter',
  chapterItem = 'chapter_item',
}

const TableSpecs: { [k: string]: TableSpec } = {
  [DBTable.version]: {
    columns: {
      id: 'INTEGER PRIMARY KEY',
      comment: 'TEXT',
    },
  },
  [DBTable.book]: {
    columns: {
      id: 'INTEGER PRIMARY KEY',
      title: 'TEXT NOT NULL',
    },
  },
  [DBTable.chapter]: {
    columns: {
      id: 'INTEGER PRIMARY KEY',
      bookId: 'INTEGER NOT NULL',
      title: 'TEXT NOT NULL',
    },
    foreignKeys: {
      bookId: `${DBTable.book} (id) ON DELETE CASCADE`,
    },
  },
  [DBTable.chapterItem]: {
    columns: {
      id: 'INTEGER PRIMARY KEY',
      chapterId: 'INTEGER NOT NULL',
      content: 'TEXT NOT NULL',
      state: 'TEXT NOT NULL',
    },
    foreignKeys: {
      chapterId: `${DBTable.chapter} (id) ON DELETE CASCADE`,
    },
  },
};

const tableIndexes: Spec = {
  chapter_on_book_id: `${DBTable.chapter} (bookId)`,
  chapter_item_on_chapter_id: `${DBTable.chapterItem} (chapterId)`,
  chapter_item_on_state: `${DBTable.chapterItem} (state)`,
};

const getCreateTableSQL = (
  name: string,
  columns: Spec,
  foreignKeys: Spec | null = null,
) => {
  const columnStrings: String[] = [];
  const constrainStrings: String[] = [];

  Object.keys(columns).forEach(key => {
    columnStrings.push(`${key} ${columns[key]}`);
  });

  if (foreignKeys) {
    Object.keys(foreignKeys).forEach(key => {
      constrainStrings.push(
        `FOREIGN KEY (${key}) REFERENCES ${foreignKeys[key]}`,
      );
    });
  }

  const columnsSQL = columnStrings.join(', ');
  const constrainsSQL = constrainStrings.join(', ');

  const query = `CREATE TABLE ${name} (${columnsSQL}${
    constrainsSQL.length > 0 ? `, ${constrainsSQL}` : ''
  })`;

  console.log(query);

  return query;
};

export const createDatabaseTables = (tx: Transaction) => {
  tx.executeSql(
    getCreateTableSQL(DBTable.version, TableSpecs[DBTable.version].columns),
  );
  tx.executeSql(
    getCreateTableSQL(DBTable.book, TableSpecs[DBTable.book].columns),
  );
  tx.executeSql(
    getCreateTableSQL(
      DBTable.chapter,
      TableSpecs[DBTable.chapter].columns,
      TableSpecs[DBTable.chapter].foreignKeys,
    ),
  );
  tx.executeSql(
    getCreateTableSQL(
      DBTable.chapterItem,
      TableSpecs[DBTable.chapterItem].columns,
      TableSpecs[DBTable.chapterItem].foreignKeys,
    ),
  );

  Object.keys(tableIndexes).map(key =>
    tx.executeSql(`CREATE INDEX ${key} ON ${tableIndexes[key]}`),
  );

  tx.executeSql(
    `INSERT INTO ${DBTable.version} (comment) VALUES ("Initial version");`,
  );
  tx.executeSql(`INSERT INTO ${DBTable.book} (title) VALUES ("Demo book");`);
};
