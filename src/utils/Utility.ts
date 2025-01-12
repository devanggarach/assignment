export class Utility {
  static isEmpty(inputParam): boolean {
    return inputParam == null || inputParam == undefined || inputParam?.length < 1 ? true : false;
  }

  static enumToArrayMongoFields(enumVal): Array<string> {
    
    const temp: Array<string> = [];

    if (!Utility.isEmpty(enumVal)) {
      for (let i = 0; i < enumVal.length; i++) {
        temp.push(enumVal[i].toString());
      }
    }
    temp.push('-_id');
    
    return temp;
  }
}
