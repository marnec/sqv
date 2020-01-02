export class Log {

  static log = 0;


  static s(lvl: number) {
    Log.log = lvl;
  }

  static w(lvl: number, e: string) {
    if (lvl <= Log.log) {
      console.warn(e);
    }
  }

}
