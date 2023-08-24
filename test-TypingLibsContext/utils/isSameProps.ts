/********************************************
 * Compare two object properties
 *
 * 同じである:
 * 不足である:      何が不足しているのか教えてほしい
 * 追加されている:  何が追加されているのか教えてほしい
 *
 * operand1よりoperand2は～が不足している
 * operand1よりoperand2は～が追加されている
 *
 * 常にoperand1に対してoperand2がどうであるのかを返す。
 *
 * ******************************************/
export const compareTwoObjectProps = <T>(operand1: T, operand2: T): boolean => {
    // 汎用性のある内容にすること。特定の場合にのみ使える仕様にしないこと
};
