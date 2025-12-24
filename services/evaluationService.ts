
import { 
  CriteriaData, 
  EvaluationResult, 
  EvaluationStatus, 
  StudentType, 
  CategoryResult 
} from '../types';
import { GPA_MIN, TRAINING_POINTS_MIN, VOLUNTEER_DAYS_MIN } from '../constants';

/**
 * Công thức tính % mức độ sẵn sàng:
 * Nếu đạt toàn bộ Tiêu chí Cứng (Hard): Điểm nền = 70%
 * Mỗi thành tích tiêu chí Mềm (Soft) cộng thêm điểm ưu tiên:
 * - Đạo đức (Soft): Tối đa +6%
 * - Học tập (Soft): Tối đa +6%
 * - Tình nguyện (Soft): Tối đa +6%
 * - Hội nhập (Soft): Tối đa +6%
 * - Thể lực: Đạt cứng là đạt, không có mềm riêng.
 * Tổng tối đa: 70% (Hard) + 24% (Soft) + 6% (Bonus khác/Dự phòng) = 100%
 */

export const evaluateReadiness = (data: CriteriaData, studentType: StudentType): EvaluationResult => {
  // 1. ĐẠO ĐỨC TỐT
  const ethicsResult: CategoryResult = {
    isHardPassed: false,
    isAlmostPassed: false,
    hardFails: [],
    softBonus: 0,
    tips: []
  };
  const isTrainingOk = data.trainingPoints >= TRAINING_POINTS_MIN;
  const isNoDiscipline = data.noDiscipline;
  
  if (!isTrainingOk) ethicsResult.hardFails.push(`Điểm rèn luyện (${data.trainingPoints}) chưa đạt chuẩn 90`);
  if (!isNoDiscipline) ethicsResult.hardFails.push("Vi phạm kỷ luật/nội quy");
  
  ethicsResult.isHardPassed = isTrainingOk && isNoDiscipline;
  if (data.marxistMember) ethicsResult.softBonus += 3;
  if (data.exemplaryYouth) ethicsResult.softBonus += 3;
  
  if (!ethicsResult.isHardPassed) {
    ethicsResult.tips.push("Tích cực tham gia các buổi sinh hoạt chuyên đề, hoạt động Đoàn - Hội để nâng cao điểm rèn luyện.");
    if (data.trainingPoints >= 85) ethicsResult.isAlmostPassed = true;
  }

  // 2. HỌC TẬP TỐT
  const studyResult: CategoryResult = {
    isHardPassed: false,
    isAlmostPassed: false,
    hardFails: [],
    softBonus: 0,
    tips: []
  };
  const minGpa = GPA_MIN[studentType];
  const isGpaOk = data.gpa >= minGpa;
  
  if (!isGpaOk) studyResult.hardFails.push(`GPA (${data.gpa}) chưa đạt chuẩn ${minGpa}`);
  
  studyResult.isHardPassed = isGpaOk;
  if (data.scientificResearch || data.journalArticle || data.conferencePaper || data.invention) studyResult.softBonus += 3;
  if (data.academicTeamMember || data.academicCompetitionAward) studyResult.softBonus += 3;

  if (!studyResult.isHardPassed) {
    studyResult.tips.push("Tập trung cải thiện điểm trung bình học kỳ này hoặc đăng ký học cải thiện các môn điểm thấp.");
    if (data.gpa >= minGpa - 0.2) studyResult.isAlmostPassed = true;
  }

  // 3. THỂ LỰC TỐT (Đạt 1 trong 2)
  const physicalResult: CategoryResult = {
    isHardPassed: false,
    isAlmostPassed: false,
    hardFails: [],
    softBonus: 0,
    tips: []
  };
  physicalResult.isHardPassed = data.isHealthyStudent || data.sportAward;
  if (!physicalResult.isHardPassed) {
    physicalResult.hardFails.push("Chưa đạt Sinh viên khỏe hoặc Giải thể thao cấp trường");
    physicalResult.tips.push("Tham gia Hội thao cấp trường hoặc các đợt kiểm tra Sinh viên khỏe do Hội Sinh viên tổ chức.");
  }

  // 4. TÌNH NGUYỆN TỐT
  const volunteerResult: CategoryResult = {
    isHardPassed: false,
    isAlmostPassed: false,
    hardFails: [],
    softBonus: 0,
    tips: []
  };
  const isDaysOk = data.volunteerDays >= VOLUNTEER_DAYS_MIN;
  const isAwardOk = data.volunteerAward;
  
  if (!isDaysOk) volunteerResult.hardFails.push(`Số ngày tình nguyện (${data.volunteerDays}) chưa đủ 5 ngày`);
  if (!isAwardOk) volunteerResult.hardFails.push("Chưa có khen thưởng tình nguyện cấp huyện trở lên");
  
  volunteerResult.isHardPassed = isDaysOk && isAwardOk;
  if (data.volunteerLeader) volunteerResult.softBonus += 3;
  if (data.volunteerDays >= 10) volunteerResult.softBonus += 3;

  if (!volunteerResult.isHardPassed) {
    volunteerResult.tips.push("Đăng ký tham gia các chiến dịch lớn như Mùa hè xanh, Xuân tình nguyện để tích lũy ngày công và khen thưởng.");
    if (data.volunteerDays >= 4) volunteerResult.isAlmostPassed = true;
  }

  // 5. HỘI NHẬP TỐT (Bắt buộc đủ cả 3)
  const integrationResult: CategoryResult = {
    isHardPassed: false,
    isAlmostPassed: false,
    hardFails: [],
    softBonus: 0,
    tips: []
  };
  const isSkillOk = data.skillCourseOrUnionAward;
  const isActOk = data.integrationActivity;
  const isEngOk = data.englishB1OrGpa;
  
  if (!isSkillOk) integrationResult.hardFails.push("Thiếu khoá kỹ năng hoặc khen thưởng Đoàn - Hội");
  if (!isActOk) integrationResult.hardFails.push("Chưa tham gia hoạt động hội nhập cấp trường");
  if (!isEngOk) integrationResult.hardFails.push("Chưa đạt chuẩn ngoại ngữ B1 hoặc tương đương");
  
  integrationResult.isHardPassed = isSkillOk && isActOk && isEngOk;
  if (data.internationalExchange) integrationResult.softBonus += 3;
  if (data.foreignLanguageCompetition) integrationResult.softBonus += 3;

  if (!integrationResult.isHardPassed) {
    integrationResult.tips.push("Tham gia các buổi talkshow quốc tế, thi chứng chỉ ngoại ngữ hoặc các lớp kỹ năng thực hành xã hội.");
  }

  // TỔNG HỢP KẾT QUẢ
  const allHardPassed = ethicsResult.isHardPassed && studyResult.isHardPassed && 
                        physicalResult.isHardPassed && volunteerResult.isHardPassed && 
                        integrationResult.isHardPassed;

  let overallStatus = EvaluationStatus.NOT_ELIGIBLE;
  let readinessScore = 0;

  if (allHardPassed) {
    overallStatus = EvaluationStatus.ELIGIBLE;
    // Điểm nền 70 + tổng điểm mềm (tối đa 24) + bonus 6% nếu hoàn thiện xuất sắc
    const totalSoft = ethicsResult.softBonus + studyResult.softBonus + volunteerResult.softBonus + integrationResult.softBonus;
    readinessScore = 70 + totalSoft + (totalSoft >= 20 ? 6 : 0);
  } else {
    // Nếu chưa đủ điều kiện, tính % dựa trên số tiêu chí cứng đã đạt (mỗi mảng 14%)
    const hardMetCount = [ethicsResult, studyResult, physicalResult, volunteerResult, integrationResult].filter(r => r.isHardPassed).length;
    readinessScore = hardMetCount * 14;
    
    const anyAlmost = [ethicsResult, studyResult, physicalResult, volunteerResult, integrationResult].some(r => r.isAlmostPassed);
    if (anyAlmost && hardMetCount >= 3) overallStatus = EvaluationStatus.ALMOST_READY;
  }

  return {
    overallStatus,
    readinessScore: Math.min(readinessScore, 100),
    categoryResults: {
      ethics: ethicsResult,
      study: studyResult,
      physical: physicalResult,
      volunteer: volunteerResult,
      integration: integrationResult
    }
  };
};
