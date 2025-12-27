// Recommendation Service - Provides AI-based suggestions based on profile and evidence

export interface RecommendationItem {
  category: string;
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  actions: string[];
  estimatedTimeline: string;
}

export interface Recommendations {
  overallInsight: string;
  items: RecommendationItem[];
  nextSteps: string[];
}

/**
 * Generate personalized recommendations based on student profile and current criteria data
 */
export const generateRecommendations = (
  criteria: any,
  evaluationResult: any,
  profile: any
): Recommendations => {
  const recommendations: RecommendationItem[] = [];
  
  // Analyze each category and provide specific recommendations
  
  // 1. ETHICS category
  if (!evaluationResult.categoryResults.ethics.isHardPassed) {
    const failingReqs = evaluationResult.categoryResults.ethics.hardFails;
    
    if (failingReqs.includes('marxistMember') && !criteria.marxistMember) {
      recommendations.push({
        category: 'ethics',
        priority: 'high',
        title: 'Đăng ký tham gia Đảng Cộng sản',
        description: 'Để đạt tiêu chí Đạo đức Cách mạng, bạn cần là thành viên Đảng Cộng sản hoặc sắp sửa được tiếp nhận.',
        actions: [
          'Liên hệ với chi bộ đảng của khoa',
          'Hoàn thành thủ tục đề cử thành viên',
          'Tham dự các lớp học chính trị'
        ],
        estimatedTimeline: '3-6 tháng'
      });
    }

    if (failingReqs.includes('noDiscipline') && !criteria.noDiscipline) {
      recommendations.push({
        category: 'ethics',
        priority: 'high',
        title: 'Tuân thủ quy tắc kỷ luật',
        description: 'Không có vi phạm kỷ luật là điều kiện bắt buộc. Hãy chắc chắn rằng hồ sơ của bạn sạch sẽ.',
        actions: [
          'Kiểm tra lại hồ sơ kỷ luật tại Phòng Công tác sinh viên',
          'Nếu có vi phạm, cố gắng tìm cách khắc phục'
        ],
        estimatedTimeline: 'Ngay lập tức'
      });
    }
  }

  // 2. STUDY category
  if (!evaluationResult.categoryResults.study.isHardPassed) {
    const failingReqs = evaluationResult.categoryResults.study.hardFails;
    
    if (failingReqs.includes('gpa') && criteria.gpa < 3.0) {
      recommendations.push({
        category: 'study',
        priority: 'high',
        title: 'Nâng cao điểm GPA',
        description: 'GPA tối thiểu 3.0 là yêu cầu bắt buộc. Bạn cần cải thiện kết quả học tập.',
        actions: [
          'Tập trung vào các môn có điểm thấp',
          'Tham gia các lớp học thêm nếu cần',
          'Lên kế hoạch ôn tập có hệ thống',
          'Tham khảo ý kiến từ giảng viên'
        ],
        estimatedTimeline: '1-2 học kỳ'
      });
    }

    if (failingReqs.includes('scientificResearch') && !criteria.scientificResearch) {
      recommendations.push({
        category: 'study',
        priority: 'medium',
        title: 'Tham gia nghiên cứu khoa học',
        description: 'Tham gia một hoạt động NCKH sẽ giúp bạn đạt tiêu chí Học tập Xuất sắc.',
        actions: [
          'Tìm một dự án NCKH phù hợp với ngành học',
          'Tham gia nhóm NCKH của khoa',
          'Liên hệ với giáo sư để được hướng dẫn'
        ],
        estimatedTimeline: '3-6 tháng'
      });
    }
  }

  // 3. PHYSICAL category
  if (!evaluationResult.categoryResults.physical.isHardPassed) {
    if (!criteria.isHealthyStudent) {
      recommendations.push({
        category: 'physical',
        priority: 'medium',
        title: 'Đạt tiêu chí Sức khỏe',
        description: 'Bạn cần đạt chuẩn thể lực được quy định trong bảng tiêu chí.',
        actions: [
          'Tham dự kiểm tra sức khỏe định kỳ',
          'Tập luyện thể dục đều đặn',
          'Tham gia các hoạt động thể thao của trường'
        ],
        estimatedTimeline: '2-3 tháng'
      });
    }
  }

  // 4. VOLUNTEER category
  if (!evaluationResult.categoryResults.volunteer.isHardPassed) {
    if (criteria.volunteerDays < 10) {
      recommendations.push({
        category: 'volunteer',
        priority: 'high',
        title: 'Tăng ngày tình nguyện',
        description: `Bạn cần ít nhất 10 ngày tình nguyện. Hiện tại bạn có ${criteria.volunteerDays} ngày.`,
        actions: [
          'Đăng ký tham gia các chương trình "Mùa hè xanh"',
          'Tham gia các hoạt động tình nguyện của khoa',
          'Tham gia cộng tác viên xã hội'
        ],
        estimatedTimeline: '3-4 tháng'
      });
    }
  }

  // 5. INTEGRATION category
  if (!evaluationResult.categoryResults.integration.isHardPassed) {
    const failingReqs = evaluationResult.categoryResults.integration.hardFails;
    
    if (failingReqs.includes('englishB1OrGpa')) {
      recommendations.push({
        category: 'integration',
        priority: 'high',
        title: 'Đạt chuẩn ngoại ngữ B1 hoặc GPA 3.5+',
        description: 'Yêu cầu này là bắt buộc để đạt tiêu chí Hội nhập quốc tế.',
        actions: [
          'Luyện thi ngoại ngữ (IELTS, TOEIC, JLPT, v.v.)',
          'Tham dự các lớp ngoại ngữ bổ sung',
          'Hoặc cố gắng nâng GPA lên 3.5+'
        ],
        estimatedTimeline: '3-6 tháng'
      });
    }

    if (!criteria.internationalExchange && !criteria.foreignLanguageCompetition) {
      recommendations.push({
        category: 'integration',
        priority: 'medium',
        title: 'Tham gia hoạt động hội nhập quốc tế',
        description: 'Tham gia trao đổi quốc tế hoặc cuộc thi ngoại ngữ sẽ là điểm cộng.',
        actions: [
          'Đăng ký chương trình trao đổi sinh viên',
          'Tham gia cuộc thi tiếng Anh, tiếng Nhật, v.v.',
          'Tham dự các hội thảo quốc tế'
        ],
        estimatedTimeline: '6-12 tháng'
      });
    }
  }

  // Generate overall insight
  const failingCategories = (
    Object.keys(evaluationResult.categoryResults) as Array<keyof typeof evaluationResult.categoryResults>
  ).filter(cat => !evaluationResult.categoryResults[cat].isHardPassed);

  let overallInsight = '';
  if (failingCategories.length === 0) {
    overallInsight = `🎉 Xuất sắc! Bạn đã đạt tiêu chí cho Sinh viên 5 Tốt. Tiếp tục duy trì phẩm chất và hoàn thiện hơn nữa các tiêu chí khác.`;
  } else if (failingCategories.length === 1) {
    overallInsight = `📈 Rất tốt! Chỉ còn một tiêu chí cần hoàn thành. Hãy tập trung vào ${failingCategories[0]} để hoàn thiện hồ sơ.`;
  } else if (failingCategories.length <= 3) {
    overallInsight = `⚡ Còn ${failingCategories.length} tiêu chí cần hoàn thiện. Bạn có thể đạt tiêu chuẩn nếu hoàn thành các khuyến nghị trong vòng ${profile.studentType === 'UNIVERSITY' ? '1-2 kỳ' : '6 tháng'}.`;
  } else {
    overallInsight = `💪 Bạn cần nỗ lực nhiều hơn nữa. Với kế hoạch rõ ràng, bạn hoàn toàn có thể đạt được Sinh viên 5 Tốt. Hãy bắt đầu từ các tiêu chí ưu tiên cao trước.`;
  }

  return {
    overallInsight,
    items: recommendations,
    nextSteps: [
      'Xem lại chi tiết các khuyến nghị ở trên',
      'Lập kế hoạch hành động cụ thể',
      'Liên hệ với người hướng dẫn hoặc cố vấn của bạn',
      'Cập nhật tiến trình thường xuyên'
    ]
  };
};

/**
 * Get category-specific insights
 */
export const getCategoryInsight = (
  category: string,
  categoryResult: any,
  criteria: any
): string => {
  const insights: Record<string, string> = {
    ethics: `Đạo đức Cách mạng: ${categoryResult.isHardPassed ? '✅ Đã đạt' : '❌ Chưa đạt'}. ${
      categoryResult.softBonus > 0 ? `Điểm cộng: ${categoryResult.softBonus}` : ''
    }`,
    study: `Học tập Xuất sắc: ${categoryResult.isHardPassed ? '✅ Đã đạt' : '❌ Chưa đạt'}. ${
      categoryResult.softBonus > 0 ? `Điểm cộng: ${categoryResult.softBonus}` : ''
    }`,
    physical: `Sức khỏe: ${categoryResult.isHardPassed ? '✅ Đã đạt' : '❌ Chưa đạt'}. ${
      categoryResult.softBonus > 0 ? `Điểm cộng: ${categoryResult.softBonus}` : ''
    }`,
    volunteer: `Tình nguyện Vì cộng đồng: ${categoryResult.isHardPassed ? '✅ Đã đạt' : '❌ Chưa đạt'}. ${
      categoryResult.softBonus > 0 ? `Điểm cộng: ${categoryResult.softBonus}` : ''
    }`,
    integration: `Hội nhập quốc tế: ${categoryResult.isHardPassed ? '✅ Đã đạt' : '❌ Chưa đạt'}. ${
      categoryResult.softBonus > 0 ? `Điểm cộng: ${categoryResult.softBonus}` : ''
    }`
  };

  return insights[category] || '';
};
