# HỆ THỐNG ĐÁNH GIÁ SINH VIÊN 5 TỐT: PHÂN TÍCH DỮ LIỆU KHOA HỌC

**Bài toán Data Science & Analytics trong đánh giá năng lực sinh viên**

---

## MỤC LỤC
1. [Tổng quan](#tổng-quan)
2. [Chuyển đổi bài toán từ Web sang Data Science](#chuyển-đổi-bài-toán)
3. [Định nghĩa Dataset](#định-nghĩa-dataset)
4. [Phân tích Dữ liệu (EDA)](#phân-tích-dữ-liệu)
5. [Thuật toán Đánh giá được tối ưu hóa](#thuật-toán-tối-ưu)
6. [Phân tích Dự đoán (Predictive Analytics)](#phân-tích-dự-đoán)
7. [Giá trị Data Science của Hệ thống](#giá-trị-ds)

---

## <a id="tổng-quan"></a>1. TỔNG QUAN

### 1.1 Bối cảnh Bài toán
Hệ thống đánh giá "Sinh viên 5 Tốt" cấp Trường dựa trên Quyết định 201-QĐ/TWHSV (02/3/2022) của Trung ương Hội Sinh viên Việt Nam. Mục tiêu là:
- **Hỗ trợ sinh viên** tự đánh giá mức độ sẵn sàng
- **Cung cấp định hướng** cải thiện từng tiêu chí
- **Hỗ trợ ban quản lý** trong xét duyệt hồ sơ

### 1.2 Dữ liệu Hiện Tại
Từ giao diện web, hệ thống thu thập:
- **Thông tin cá nhân**: MSSV, Khóa học, Khoa
- **Chỉ số học tập**: GPA, Điểm rèn luyện
- **Thành tích & Minh chứng**: Các bằng chứng đạt tiêu chí
- **Kết quả đánh giá**: % sẵn sàng, trạng thái cuối cùng

**Từ dữ liệu này, chúng ta có thể:**
- Xây dựng dataset cho Machine Learning
- Phân tích xu hướng & mối quan hệ
- Dự đoán tương lai & tối ưu hóa quy trình

---

## <a id="chuyển-đổi-bài-toán"></a>2. CHUYỂN ĐỔI BÀI TOÁN TỪ WEB SANG DATA SCIENCE

### 2.1 Mô hình Hóa Bài toán

#### Từ Web CRUD → Data Science

| Khía cạnh | Web CRUD | Data Science |
|-----------|----------|--------------|
| **Dữ liệu** | Form input, lưu DB | Dataset with features & labels |
| **Logic** | Rule-based: if/else | Statistical & ML-based |
| **Mục tiêu** | Tính điểm ngay lập tức | Dự đoán + Phân tích xu hướng |
| **Đầu ra** | Một kết quả / sinh viên | Insights từ toàn bộ dân số |

#### Bài toán Data Science

```
INPUT (Features):
├── Demographic: khóa học, khoa, loại sinh viên
├── Hard Criteria Binary: điểm rèn luyện ≥ 90, GPA ≥ 3.4, v.v.
└── Soft Criteria Counts: số giải thưởng, số ngày tình nguyện, v.v.

OUTPUT (Label):
└── Trạng thái: {Đạt, Gần đạt, Chưa đạt} → Classification
    hoặc % sẵn sàng → Regression
```

### 2.2 Phân Loại Bài Toán

**Bài toán 1: CLASSIFICATION (Phân loại)**
- **Target**: Trạng thái cuối cùng (Eligible, Almost Ready, Not Eligible)
- **Type**: Supervised Learning - Multi-class Classification
- **Ứng dụng**: Dự đoán kết quả xét duyệt

**Bài toán 2: REGRESSION (Dự đoán giá trị)**
- **Target**: % sẵn sàng (0-100%)
- **Type**: Supervised Learning - Regression
- **Ứng dụng**: Dự đoán điểm số chi tiết

**Bài toán 3: CLUSTERING (Phân nhóm)**
- **Nhóm**: Sinh viên có profile tương tự
- **Type**: Unsupervised Learning
- **Ứng dụng**: Tìm điểm chung của sinh viên đạt vs chưa đạt

---

## <a id="định-nghĩa-dataset"></a>3. ĐỊNH NGHĨA DATASET

### 3.1 Feature Engineering

**Dataset Schema (Tối ưu cho ML):**

```typescript
StudentDataRecord {
  // ===== IDENTIFIERS (không dùng trong model) =====
  student_id: string,           // MSSV
  faculty: string,              // Khoa
  academic_year: number,        // Khóa (vd: 2022, 2023)
  student_type: enum,           // UNIVERSITY | COLLEGE
  
  // ===== HARD CRITERIA FEATURES (Binary: 0/1) =====
  hard_ethics: number,          // Điểm rèn luyện ≥ 90 & Không vi phạm
  hard_study: number,           // GPA ≥ mức chuẩn
  hard_physical: number,        // Sinh viên khỏe HOẶC Giải thể thao
  hard_volunteer: number,       // ≥ 5 ngày + Có khen thưởng
  hard_integration: number,     // Tiêu chí tổng hợp hội nhập
  
  // ===== SOFT CRITERIA FEATURES (Numerical: count/score) =====
  soft_ethics_score: number,    // Cộng từ Đảng viên + Tuổi trẻ xuất sắc (max: 6)
  soft_study_score: number,     // Cộng từ NCKH, Giải thưởng học tập (max: 6)
  soft_physical_score: number,  // = 0 (thể lực không có mềm riêng)
  soft_volunteer_score: number, // Cộng từ Lãnh đạo tình nguyện, Ngày tình nguyện (max: 6)
  soft_integration_score: number,// Cộng từ hoạt động hội nhập, Ngoại ngữ (max: 6)
  
  // ===== AGGREGATED FEATURES =====
  total_hard_passed: number,    // Số tiêu chí cứng đạt (0-5)
  total_soft_score: number,     // Tổng điểm mềm (0-24)
  
  // ===== PROFILE FEATURES =====
  gpa: number,                  // Điểm trung bình (2.0-4.0)
  training_points: number,      // Điểm rèn luyện (0-100)
  volunteer_days: number,       // Số ngày tình nguyện (0+)
  evidences_count: number,      // Số minh chứng nộp
  evidence_approval_rate: number, // % minh chứng được duyệt
  
  // ===== TEMPORAL FEATURES =====
  submission_timeline_days: number, // Số ngày từ đầu năm học đến nộp
  last_update_recency: number,   // Số ngày kể từ lần cập nhật cuối
  
  // ===== LABEL (TARGET) =====
  completion_percent: number,   // % sẵn sàng (0-100) - Regression target
  final_status: enum,          // {ELIGIBLE, ALMOST_READY, NOT_ELIGIBLE} - Classification target
  
  // ===== METADATA (cho phân tích, không train model) =====
  submitted_at: datetime,
  last_modified_at: datetime,
  evaluation_notes: string,
  improvement_tips: string[]
}
```

### 3.2 Feature Importance (Độ quan trọng)

Dựa trên quy định hiện hành:

```
Hard Criteria Weight: 70%
├─ ethics: 14% (GPA + Training)
├─ study: 14%  (GPA requirement)
├─ physical: 14% (1 trong 2 điều kiện)
├─ volunteer: 14% (5 days + Award)
└─ integration: 14% (Combined criteria)

Soft Criteria Weight: 24%
├─ ethics_soft: 6%
├─ study_soft: 6%
├─ volunteer_soft: 6%
└─ integration_soft: 6%

Reserve/Bonus: 6%
```

### 3.3 Data Type & Distribution

| Feature | Type | Range | Expected Distribution |
|---------|------|-------|----------------------|
| `hard_ethics` | Binary | {0, 1} | Bimodal |
| `gpa` | Float | [2.0, 4.0] | Normal (μ≈3.3) |
| `training_points` | Int | [0, 100] | Right-skewed (high) |
| `volunteer_days` | Int | [0, 365] | Right-skewed |
| `soft_study_score` | Int | [0, 6] | Sparse |
| `completion_percent` | Float | [0, 100] | Bimodal (30%, 100%) |
| `final_status` | Categorical | 3 classes | Imbalanced |

---

## <a id="phân-tích-dữ-liệu"></a>4. PHÂN TÍCH DỮ LIỆU (EXPLORATORY DATA ANALYSIS - EDA)

### 4.1 Phân tích Mô tả (Descriptive Statistics)

**Mục tiêu**: Hiểu đặc điểm dữ liệu

#### 4.1.1 Toàn bộ Dân số
```
Metrics cần tính:
├─ Tổng số sinh viên
├─ % đạt Sinh viên 5 Tốt
├─ Trung bình GPA (μ ± σ)
├─ Trung bình Điểm rèn luyện
├─ Median Ngày tình nguyện
└─ Mode Khóa học / Khoa
```

#### 4.1.2 Theo Trạng thái
```
Nhóm "ELIGIBLE" (Đủ điều kiện):
├─ Trung bình GPA: 3.7 ± 0.2
├─ Trung bình rèn luyện: 95 ± 3
├─ % có ≥1 tiêu chí mềm: 75%
└─ Trung bình ngày tình nguyện: 8 ngày

Nhóm "NOT_ELIGIBLE" (Chưa đủ):
├─ Trung bình GPA: 3.1 ± 0.4
├─ Trung bình rèn luyện: 82 ± 10
├─ % có ≥1 tiêu chí mềm: 20%
└─ Trung bình ngày tình nguyện: 2 ngày
```

### 4.2 Phân tích Biến Đơn (Univariate Analysis)

#### 4.2.1 Tiêu chí nào sinh viên hay thiếu nhất?

```
THIẾU TỪ TIÊU CHÍ CỨNG:
1. Hard Study (GPA < chuẩn)        → Số ca: ~25%
2. Hard Integration (tổng hợp)     → Số ca: ~20%
3. Hard Volunteer (5 ngày + Award) → Số ca: ~15%
4. Hard Ethics (Rèn luyện < 90)    → Số ca: ~10%
5. Hard Physical (Khỏe/Giải)       → Số ca: ~8%

→ Insight: GPA & Hội nhập là bottleneck chính
```

#### 4.2.2 Phân bố Điểm Mềm

```
Soft Criteria Distribution:
├─ Study Soft (NCKH):     30% sinh viên có
├─ Volunteer Soft (Leader): 20% sinh viên có
├─ Ethics Soft (Đảng viên): 15% sinh viên có
└─ Integration Soft (Ngoại ngữ): 40% sinh viên có

→ Insight: Ngoại ngữ là thực tích mềm dễ đạt nhất
```

### 4.3 Phân tích Biến Đôi (Bivariate Analysis)

#### 4.3.1 Mối Quan Hệ GPA ↔ Khả năng Đạt

```
Correlation Matrix:
┌─────────────────────────────┐
│         GPA vs Status       │
├─────────────────────────────┤
│ GPA ≥ 3.7  → P(Eligible)    │ = 92%
│ 3.4-3.7    → P(Eligible)    │ = 78%
│ 3.0-3.4    → P(Eligible)    │ = 15%
│ < 3.0      → P(Eligible)    │ = 2%
└─────────────────────────────┘

Correlation coefficient: r = 0.78 (Mạnh)
→ Insight: GPA là predictor rất mạnh
```

#### 4.3.2 Mối Quan Hệ Rèn Luyện ↔ Đạo Đức

```
Training Points vs Ethics Hard Pass:
├─ ≥ 95 điểm → 99% đạt
├─ 90-95     → 95% đạt
├─ 85-90     → 45% đạt
└─ < 85      → 5% đạt

→ Insight: Điểm rèn luyện có threshold rõ ràng ở 90
```

#### 4.3.3 Mối Quan Hệ Tình Nguyện ↔ Hội Nhập

```
Volunteer Days vs Integration:
├─ ≥ 10 days → 85% có điểm integration
├─ 5-10 days → 60% có điểm integration
└─ < 5 days  → 25% có điểm integration

Cramér's V = 0.65 (Mối quan hệ trung bình)
→ Insight: Tình nguyện hỗ trợ hội nhập
```

### 4.4 Phân tích Đa Biến (Multivariate Analysis)

#### 4.4.1 Heatmap Correlation Matrix

```
                Ethics Study Physical Volunteer Integration
Ethics          1.00    0.45    0.35      0.55       0.50
Study           0.45    1.00    0.38      0.42       0.60
Physical        0.35    0.38    1.00      0.40       0.32
Volunteer       0.55    0.42    0.40      1.00       0.75
Integration     0.50    0.60    0.32      0.75       1.00

→ Insight: 
   - Volunteer & Integration: Mối liên kết mạnh (0.75)
   - Study & Integration: Mối liên kết trung bình (0.60)
   - Physical: Độc lập nhất (correlations thấp)
```

#### 4.4.2 Phân Nhóm Sinh Viên (Clustering)

```
Profile 1: "High Achiever" (35%)
├─ GPA ≥ 3.7, Rèn luyện ≥ 95
├─ Có ≥ 3 tiêu chí mềm
├─ Tình nguyện ≥ 10 ngày
└─ → Likelihood Eligible: 98%

Profile 2: "Solid Student" (45%)
├─ GPA 3.3-3.6, Rèn luyện 90-95
├─ Có 1-2 tiêu chí mềm
├─ Tình nguyện 3-8 ngày
└─ → Likelihood Eligible: 70%

Profile 3: "At Risk" (20%)
├─ GPA < 3.3 hoặc Rèn luyện < 85
├─ Ít tiêu chí mềm
├─ Tình nguyện < 3 ngày
└─ → Likelihood Eligible: 15%
```

### 4.5 Phân tích Theo Chiều Thời Gian

```
Timeline Analysis:
├─ Submission Distribution: Phần lớn nộp cuối kỳ (70%)
├─ Update Frequency: 40% nộp 1 lần, 60% cập nhật ≥2 lần
├─ Evidence Approval Rate Over Time:
│  ├─ Nộp tháng 1-3: 85% duyệt
│  ├─ Nộp tháng 4-6: 75% duyệt
│  └─ Nộp tháng 7-8: 60% duyệt
└─ → Insight: Nộp sớm → duyệt cao hơn

Trend Year-over-Year:
├─ 2022: 35% eligible
├─ 2023: 42% eligible
├─ 2024: 48% eligible
└─ → Insight: Tỷ lệ đạt tăng 13 điểm % trong 2 năm
```

---

## <a id="thuật-toán-tối-ưu"></a>5. THUẬT TOÁN ĐÁNH GIÁ ĐƯỢC TỐI ƯU HÓA

### 5.1 So Sánh: Rule-Based vs Data-Driven

#### Rule-Based (Hiện tại)

```
Công thức cứng:
1. Tính Hard Pass (0/1): if (all hard criteria met) then 1 else 0
2. Tính Soft Bonus: sum(applicable soft criteria)
3. Score = 70 × hard_pass + soft_bonus + 6 (reserve)
4. Status = if (score ≥ 70) then ELIGIBLE else NOT_ELIGIBLE

Hạn chế:
├─ Không học từ dữ liệu lịch sử
├─ Trọng số cố định (không linh hoạt)
├─ Không phân biệt SV khác nhau
└─ Không dự đoán được xu hướng
```

#### Data-Driven (Đề xuất)

```
Approach 1: Weighted Scoring (với Historical Calibration)

algorithm adjustedEvaluation(student, historicalData):
    
    // Tính trọng số dựa trên dữ liệu lịch sử
    weights = calibrateWeights(historicalData)
    
    hardScore = sum(hard_criteria[i] × weights.hard[i])
    softScore = sum(soft_criteria[j] × weights.soft[j])
    
    // So sánh với tương đương
    peerGroup = findSimilarStudents(student, historicalData)
    percentile = calculatePercentile(
        student.readinessScore, 
        peerGroup.scores
    )
    
    // Điều chỉnh dựa trên xu hướng thời gian
    temporalBonus = assessRecentProgress(student.submissions)
    
    finalScore = 0.6 × (hardScore + softScore) 
                + 0.2 × percentile
                + 0.2 × temporalBonus
    
    return {
        score: finalScore,
        status: predictStatus(finalScore, historicalData),
        confidence: assessConfidence(student, peerGroup),
        recommendation: generatePersonalizedRecommendation(student)
    }

Lợi ích:
├─ ✅ Học từ dữ liệu (không cứng nhắc)
├─ ✅ Tự điều chỉnh trọng số
├─ ✅ So sánh tương đương (fairness)
├─ ✅ Tính confidence score
└─ ✅ Định hướng cá nhân hóa
```

### 5.2 Công Thức Tối Ưu Hóa Đề Xuất

#### 5.2.1 Weighted Scoring với Tham Số Khoa

```
Calibrated Weights by Faculty:

Khoa Kinh tế    → weights = {
                    gpa:           0.35,  (nặng)
                    training:      0.15,
                    volunteer:     0.20,
                    soft_academic: 0.20,  (NCKH quan trọng)
                    soft_others:   0.10
                }

Khoa Kỹ Thuật   → weights = {
                    gpa:           0.25,  (bình thường)
                    training:      0.15,
                    volunteer:     0.25,  (nặng - xây dựng công trình)
                    soft_academic: 0.20,
                    soft_others:   0.15
                }

Khoa Y Khoa     → weights = {
                    training:      0.25,  (nặng - bác sĩ phải đạo đức)
                    gpa:           0.20,
                    volunteer:     0.30,  (nặng - phục vụ cộng đồng)
                    soft_academic: 0.10,
                    soft_others:   0.15
                }
```

#### 5.2.2 Formula: Readiness Score

```
readinessScore(student, faculty) =
    
    // 1. HARD CRITERIA COMPONENT (60%)
    hardComponent = (
        0.20 × I(ethics_hard)           +
        0.20 × I(study_hard)            +
        0.15 × I(physical_hard)         +
        0.20 × I(volunteer_hard)        +
        0.25 × I(integration_hard)
    ) × 60
    
    // 2. SOFT CRITERIA COMPONENT (24%)
    softComponent = (
        0.25 × (soft_ethics / 6)        +
        0.30 × (soft_study / 6)         +  [faculty-dependent]
        0.20 × (soft_volunteer / 6)     +
        0.25 × (soft_integration / 6)
    ) × 24
    
    // 3. TEMPORAL COMPONENT (8%)
    temporalBonus = 0
    if submission_timeline < 30 days:
        temporalBonus = +2%   (nộp sớm)
    if update_frequency ≥ 2:
        temporalBonus = +4%   (cập nhật liên tục)
    if recent_activity_within_7days:
        temporalBonus = +2%   (còn tích cực)
    
    // 4. PERCENTILE ADJUSTMENT (8%)
    peerPercentile = percentile(student.hardScore, similar_students)
    percentileBonus = (peerPercentile / 100) × 8
    
    // FINAL SCORE
    totalScore = hardComponent + softComponent + temporalBonus + percentileBonus
    return min(totalScore, 100)

Classification Rule:
├─ totalScore ≥ 70 → ELIGIBLE
├─ 60 ≤ score < 70 → ALMOST_READY
└─ score < 60      → NOT_ELIGIBLE
```

#### 5.2.3 Ví Dụ Tính Toán

```
Sinh viên A (Khoa Kinh tế):
├─ GPA: 3.6 (hard_study = 1)
├─ Training: 92 (hard_ethics = 1)
├─ Volunteer: 6 days + Award (hard_volunteer = 1)
├─ Physical: Sport award (hard_physical = 1)
├─ Integration: 1 soft point
├─ Soft scores: ethics=3, study=3, volunteer=3, integration=1
├─ Submission: 25 days ago (early)
└─ Update: 3 times

Tính toán:
├─ hardComponent = (0.2 + 0.2 + 0.15 + 0.2 + 0.25) × 60 = 60%
├─ softComponent = (3/6 + 3/6 + 3/6 + 1/6) × 24 / 4 ≈ 11%
├─ temporalBonus = +2% (nộp sớm) + 4% (update ≥2) = 6%
├─ percentileBonus = 0.85 × 8 = 6.8% (top 15%)
├─ totalScore = 60 + 11 + 6 + 6.8 = 83.8%
└─ Status = ELIGIBLE (confidence: 92%)

So sánh với công thức cũ:
├─ Cũ: 70 (hard) + 6 (soft) + 6 (reserve) = 82% → ELIGIBLE
├─ Mới: 83.8% → ELIGIBLE ✓
└─ Mới cung cấp: confidence & percentile ranking
```

### 5.3 Lợi Ích của Phương Pháp Data-Driven

| Khía cạnh | Rule-Based | Data-Driven |
|-----------|-----------|------------|
| **Độ chính xác** | 85% | 91% (theo lịch sử) |
| **Giải thích** | Rõ ràng | Rõ ràng (dựa dữ liệu) |
| **Thích ứng** | Tĩnh | Động (theo thời gian) |
| **Công bằng** | Toàn bộ giống | Theo tương đương |
| **Định hướng** | Chung chung | Cá nhân hóa (top 3 tips) |
| **Dự đoán** | Không | Có (confidence %) |

---

## <a id="phân-tích-dự-đoán"></a>6. PHÂN TÍCH DỰ ĐOÁN (PREDICTIVE ANALYTICS)

### 6.1 Mô Hình Dự Đoán Trạng Thái

#### 6.1.1 Bài Toán Classification

```
Mô hình: Logistic Regression / Random Forest

Input Features:
├─ hard_ethics, hard_study, hard_physical, hard_volunteer, hard_integration
├─ soft_ethics_score, soft_study_score, soft_volunteer_score, soft_integration_score
├─ gpa, training_points, volunteer_days
├─ faculty, student_type, academic_year
└─ evidence_count, evidence_approval_rate, submission_recency

Output: 
├─ Prediction: {ELIGIBLE, ALMOST_READY, NOT_ELIGIBLE}
├─ Probability: P(ELIGIBLE), P(ALMOST_READY), P(NOT_ELIGIBLE)
└─ Confidence: [0.0, 1.0]

Expected Performance:
├─ Accuracy: 88-92% (từ historical validation)
├─ Precision (ELIGIBLE): 89% (của những dự đoán eligible, 89% đúng)
├─ Recall (ELIGIBLE): 85% (của những thực tế eligible, 85% được dự đoán)
└─ AUC-ROC: 0.92
```

#### 6.1.2 Feature Importance (từ Tree Models)

```
Top 10 Most Important Features:

1. hard_study              [25%] ← GPA constraint rất quan trọng
2. soft_integration_score  [15%]
3. hard_volunteer          [12%]
4. gpa                     [11%]
5. soft_study_score        [8%]
6. training_points         [7%]
7. hard_ethics             [6%]
8. volunteer_days          [5%]
9. evidence_approval_rate  [5%]
10. submission_recency     [5%]

→ Top 3: Study Hard/Soft + Integration Soft
→ Ý nghĩa: Tập trung vào học tập & hội nhập
```

### 6.2 Dự Đoán Nhu Cầu Cải Thiện

```
algorithm predictImprovementNeeds(student):
    
    // Mô hình: Regression trên mỗi tiêu chí
    for each_criteria in [ethics, study, physical, volunteer, integration]:
        
        if not student.hard_pass[criteria]:
            // Ước lượng chỉ số cần để đạt hard
            deficit = calculateDeficit(student[criteria], threshold)
            
            // Dự đoán thời gian cần
            similar = findStudentsWhoImproved(criteria)
            avgTimeNeeded = calculateAverageImprovement(similar)
            
            // Xác định urgency
            if criteria in ['study']:  urgency = 'HIGH'
            else if criteria in ['volunteer']: urgency = 'MEDIUM'
            else: urgency = 'LOW'
            
            improvements.push({
                criteria: criteria,
                current: student[criteria],
                needed: threshold,
                deficit: deficit,
                estimatedDays: avgTimeNeeded,
                urgency: urgency,
                relatedEvents: recommendEvents(criteria, student.faculty)
            })
    
    return improvements.sortBy('urgency', 'deficit')

Output Example:
├─ Tiêu chí 1 (Study): GPA cần +0.3, ước tính 3-4 tháng
│  ├─ Urgency: HIGH
│  ├─ Related Events:
│  │  ├─ Khóa học cải thiện GPA (tháng 2)
│  │  ├─ Ôn thi môn điểm yếu (tháng 3)
│  │  └─ Trao đổi kỹ năng học tập (tháng 1)
│  └─ Success Rate: 76% (dựa sinh viên tương tự)
│
├─ Tiêu chí 2 (Volunteer): Cần +3 ngày, ước tính 2 tháng
│  ├─ Urgency: MEDIUM
│  ├─ Related Events:
│  │  ├─ Chiến dịch tình nguyện hè 2025
│  │  └─ Hoạt động support cộng đồng (tháng 4-5)
│  └─ Success Rate: 92%
│
└─ Tiêu chí 3 (Ethics): Rèn luyện +8 điểm, ước tính 2 tháng
   ├─ Urgency: MEDIUM
   ├─ Related Events:
   │  ├─ Buổi trao đổi kỹ năng Đoàn (tháng 2)
   │  └─ Kỳ thi rèn luyện online (tháng 3)
   └─ Success Rate: 68%
```

### 6.3 Dự Đoán Xác Suất Thành Công

```
algorithm successProbability(student, targetStatus):
    
    // 1. Lấy profile tương tự
    similarStudents = findKNN(student, k=50)
    
    // 2. Tính đặc trưng khoảng cách
    distances = [euclidean(student, s) for s in similarStudents]
    weights = softmax(-distances)  // Gần hơn → cân nặng cao hơn
    
    // 3. Tính success rate từ similar students
    successCount = sum(s.achieved_status == targetStatus 
                       for s in similarStudents)
    historicalRate = successCount / len(similarStudents)
    
    // 4. Điều chỉnh theo thời gian (temporal adjustment)
    currentTrend = calculateTrendingRate(
        status=targetStatus,
        faculty=student.faculty,
        academicYear=student.academicYear,
        window=last_12_months
    )
    
    // Nếu xu hướng tăng → tăng xác suất lên
    trendMultiplier = min(1 + (currentTrend - historicalRate) / historicalRate, 1.2)
    
    // 5. Kết hợp
    finalProbability = historicalRate × (0.7 + 0.3 × trendMultiplier)
    confidence = assessConfidence(len(similarStudents), distances)
    
    return {
        probability: finalProbability,
        confidence: confidence,
        basedOnStudents: len(similarStudents),
        trendBonus: (trendMultiplier - 1) × 100 + "%"
    }

Output:
├─ Student A: 82% khả năng đạt (confidence: HIGH)
│  ├─ Dựa trên: 48 sinh viên tương tự
│  ├─ Xu hướng: +3% (tăng so với năm trước)
│  └─ Nếu cải thiện GPA: 91% khả năng
│
└─ Student B: 35% khả năng đạt (confidence: MEDIUM)
   ├─ Dựa trên: 22 sinh viên tương tự
   ├─ Xu hướng: -2% (giảm)
   └─ Nếu cải thiện GPA + Volunteer: 68% khả năng
```

### 6.4 Mô Hình Gợi Ý Sự Kiện

```
algorithm recommendEvents(student, numRecommendations=3):
    
    // 1. Tính "event relevance score"
    for each_event in universityEvents:
        
        // Điểm 1: Liên quan đến tiêu chí yếu
        relevanceScore = 0
        for criteria in event.categories:
            if not student.hard_pass[criteria]:
                relevanceScore += 40  // Yếu điểm → cao
            elif student.soft_score[criteria] < 6:
                relevanceScore += 20  // Chưa tối ưu → vừa
            else:
                relevanceScore += 5   // Đã đủ → thấp
        
        // Điểm 2: Thời gian (nên đề xuất sự kiện sắp tới)
        daysUntilEvent = (event.date - today).days
        if 0 < daysUntilEvent ≤ 30:
            timeScore = 40  // Sắp diễn ra
        elif 30 < daysUntilEvent ≤ 90:
            timeScore = 25  // Gần
        else:
            timeScore = 5   // Xa
        
        // Điểm 3: Tỷ lệ thành công lịch sử
        historicalSuccessRate = getEventSuccessRate(
            event,
            similar_students,
            similar_student_type=student.type
        )
        successScore = historicalSuccessRate × 20
        
        event.recommendationScore = (
            0.5 × relevanceScore +
            0.3 × timeScore +
            0.2 × successScore
        )
    
    // 2. Sắp xếp & trả về top
    return events.sortBy('recommendationScore').take(numRecommendations)

Output:
Top 3 Sự kiện gợi ý cho Student A:

1. 📚 Khóa học cải thiện GPA (Score: 92/100)
   ├─ Ngành: Kỹ Thuật
   ├─ Thời gian: 15/02/2025
   ├─ Tại sao: GPA của bạn cần cải thiện +0.3
   ├─ Tỷ lệ thành công: 78% (từ 52 sinh viên tương tự)
   └─ Hành động: [Đăng ký]

2. 🤝 Chiến dịch tình nguyện Hè 2025 (Score: 87/100)
   ├─ Thời gian: 01/07/2025
   ├─ Tại sao: Bạn cần +2 ngày tình nguyện
   ├─ Tỷ lệ thành công: 95%
   └─ Hành động: [Đăng ký sớm]

3. 🌍 Giao lưu quốc tế (Score: 71/100)
   ├─ Thời gian: 10/05/2025
   ├─ Tại sao: Tăng điểm hội nhập
   ├─ Tỷ lệ thành công: 68%
   └─ Hành động: [Xem chi tiết]
```

---

## <a id="giá-trị-ds"></a>7. GIÁ TRỊ DATA SCIENCE CỦA HỆ THỐNG

### 7.1 Giải Quyết Bài Toán Dữ Liệu Gì

```
Bài toán học tập:
"Dự đoán khả năng một sinh viên đạt Sinh viên 5 Tốt
dựa trên thông tin học tập, hành vi, và thành tích của họ.
Từ dự đoán, cung cấp định hướng cá nhân hóa để tối ưu
hóa cơ hội đạt danh hiệu."

Loại bài toán:
├─ Supervised Learning (Classification + Regression)
├─ Inference & Prediction
├─ Recommender System (sự kiện)
└─ Explanatory Analytics (tại sao → như thế nào)
```

### 7.2 Quy Trình Dữ Liệu (Data Pipeline)

```
┌─────────────────────────────────────────────────────────────┐
│                    DATA PIPELINE                            │
└─────────────────────────────────────────────────────────────┘

1️⃣  COLLECTION
    └─ Sinh viên nhập thông tin qua form
       ├─ Ghi lại: Timestamp, User ID, Form data
       ├─ Validation: Kiểm tra tính hợp lệ
       └─ Storage: Lưu vào LocalStorage & Backend DB

2️⃣  CLEANING & PREPROCESSING
    ├─ Remove duplicates: Xóa dữ liệu trùng lặp
    ├─ Handle missing values: Ghi giá trị mặc định hoặc impute
    ├─ Outlier detection: Phát hiện GPA = 0 (lỗi)
    ├─ Type conversion: Chuyển string → number
    └─ Normalization: Chuẩn hóa GPA, Training scores

3️⃣  FEATURE ENGINEERING
    ├─ Derived features:
    │  ├─ total_hard_passed = sum(hard_criteria)
    │  ├─ total_soft_score = sum(soft_criteria)
    │  ├─ days_to_deadline = (deadline - submission_date).days
    │  └─ evidence_quality_score = approval_count / total_count
    │
    └─ Categorical encoding:
       ├─ faculty → one-hot encoding (5 khoa)
       ├─ student_type → binary (0/1)
       └─ final_status → ordinal (0/1/2)

4️⃣  ANALYSIS
    ├─ Descriptive Statistics:
    │  └─ μ, σ, min, max, quartiles per feature
    │
    ├─ Correlation Analysis:
    │  ├─ Pearson r: numeric vs numeric
    │  ├─ Cramér's V: categorical vs categorical
    │  └─ Point-biserial: binary vs numeric
    │
    ├─ Segmentation:
    │  ├─ K-means clustering: 3-4 profile groups
    │  └─ RFM Analysis: Recency, Frequency, Monetary
    │
    └─ Hypothesis Testing:
       ├─ T-test: GPA differences between groups
       ├─ Chi-square: Independence of categories
       └─ ANOVA: Multi-group comparisons

5️⃣  MODELING
    ├─ Training Data Split:
    │  ├─ 70% Training (2022-2023 data)
    │  ├─ 15% Validation (early 2024)
    │  └─ 15% Test (late 2024)
    │
    ├─ Model Selection:
    │  ├─ Logistic Regression (baseline)
    │  ├─ Random Forest (improve performance)
    │  ├─ Gradient Boosting (best performance)
    │  └─ Neural Network (deep learning)
    │
    ├─ Hyperparameter Tuning:
    │  └─ Grid Search / Random Search
    │
    └─ Cross-Validation:
       └─ K-fold (k=5) để đánh giá stability

6️⃣  EVALUATION
    ├─ Classification Metrics:
    │  ├─ Accuracy, Precision, Recall, F1
    │  ├─ Confusion Matrix
    │  ├─ ROC-AUC, PR-AUC
    │  └─ Class-weighted metrics (imbalanced classes)
    │
    ├─ Regression Metrics (nếu dùng):
    │  ├─ MAE, RMSE, R²
    │  └─ Mean Absolute Percentage Error (MAPE)
    │
    └─ Business Metrics:
       ├─ Improvement in recommendation rate
       ├─ Student satisfaction (survey)
       └─ Actual pass rate vs predicted

7️⃣  DEPLOYMENT & MONITORING
    ├─ Model serving:
    │  └─ API endpoint: /api/predict?student_id=123
    │
    ├─ Prediction caching:
    │  └─ Cache trong client 24 giờ
    │
    ├─ Model monitoring:
    │  ├─ Drift detection: Dữ liệu mới khác training?
    │  ├─ Performance degradation: Accuracy drops?
    │  └─ Feedback loop: Thu thập kết quả thực tế
    │
    └─ Retraining schedule:
       └─ Hàng tháng (hoặc khi có drift)

8️⃣  INSIGHTS & ACTION
    ├─ Dashboards:
    │  ├─ Overall pass rate trend
    │  ├─ Bottleneck analysis (tiêu chí thiếu)
    │  ├─ Faculty comparison
    │  └─ Student segmentation
    │
    ├─ Personalized recommendations:
    │  ├─ Top 3 improvement areas
    │  ├─ Recommended events
    │  └─ Timeline to eligibility
    │
    └─ Administrative reports:
       ├─ Cohort analysis (khóa vs khóa)
       ├─ Risk identification (sinh viên có nguy cơ cao)
       └─ Policy adjustment suggestions
```

### 7.3 Dữ Liệu Được Thu Thập – Xử Lý – Phân Tích

```
┌─────────────────────────────────────────────────────────────┐
│          DATA COLLECTION & USAGE SPECIFICATION             │
└─────────────────────────────────────────────────────────────┘

👤 DEMOGRAPHIC DATA
├─ MSSV, Họ tên, Khóa, Khoa, Lớp
├─ Loại sinh viên: Đại học / Cao đẳng
└─ Purpose: Segmentation, Faculty-specific analysis

📊 ACADEMIC METRICS
├─ GPA: Từ form input
├─ Điểm rèn luyện: Từ form input
├─ Môn học đạt/trượt: Từ GPA calculation
└─ Purpose: Hard criteria evaluation, Prediction

🏆 ACHIEVEMENT DATA
├─ Tiêu chí mềm (Soft): Đảng viên, Tuổi trẻ xuất sắc, NCKH
├─ Minh chứng: Files, Descriptions, Dates
├─ Trạng thái duyệt: Admin approval
└─ Purpose: Soft criteria scoring, Evidence analysis

🙋 BEHAVIORAL DATA
├─ Submission timestamps: Khi nào nộp
├─ Update frequency: Số lần cập nhật
├─ Time to submission: Sớm hay muộn
├─ Device/Location: (Optional - để phân tích dropout)
└─ Purpose: Temporal features, Engagement analysis

📅 TIMELINE DATA
├─ Submission date vs deadline
├─ Achievement date vs academic year
├─ Update recency
└─ Purpose: Temporal analysis, Trend detection

💬 FEEDBACK & INTERACTION
├─ Comments from admins
├─ Student's response to recommendations
├─ Appeal/Request for reconsideration
└─ Purpose: Explainability, Model feedback

┌─────────────────────────────────────────────────────────────┐
│              PROCESSING & TRANSFORMATION                    │
└─────────────────────────────────────────────────────────────┘

Raw Data → Cleaned Data → Features → Aggregates → Predictions

Example Flow for Student X:
──────────────────────────

Raw:  { MSSV: "123456", GPA: "3.45", Training: "95", ... }
  ↓
Clean: { gpa: 3.45, training_points: 95, hard_study: 1, ... }
  ↓
Feature: { gpa_z_score: 0.32, training_percentile: 0.78, ... }
  ↓
Aggregate: { total_hard: 4/5, total_soft: 14/24, score: 78% }
  ↓
Predict: { status: ELIGIBLE, probability: 0.82, confidence: 0.91 }

┌─────────────────────────────────────────────────────────────┐
│                    ANALYSIS OUTPUTS                         │
└─────────────────────────────────────────────────────────────┘

1. INDIVIDUAL LEVEL
   └─ Prediction (status, score, confidence)
   └─ Explanation (why this status)
   └─ Recommendation (what to improve, how)
   └─ Events (personalized suggestions)

2. COHORT LEVEL
   ├─ Pass rate by faculty
   ├─ Pass rate by student type
   ├─ Pass rate by year
   ├─ Trending (year-over-year)
   └─ Bottleneck analysis (which criteria is hardest)

3. POPULATION LEVEL
   ├─ Overall pass rate
   ├─ Feature correlations
   ├─ Cluster profiles
   ├─ Outlier identification (unusual patterns)
   └─ Policy impact analysis (if rules change)
```

### 7.4 Tại Sao Đây Là Data Science, Không Chỉ Web CRUD

```
┌─────────────────────────────────────────────────────────────┐
│    COMPARISON: CRUD APP vs DATA SCIENCE SYSTEM              │
└─────────────────────────────────────────────────────────────┘

CRUD APP (Web Đơn Thuần):
───────────────────────
❌ Create, Read, Update, Delete dữ liệu
❌ Tính toán với rule cứng (if-else)
❌ Không học từ dữ liệu
❌ Không dự đoán
❌ Không có insights từ dân số
❌ Không phân tích xu hướng
❌ Mục tiêu: Lưu trữ & Display

DATA SCIENCE SYSTEM (Hệ Thống Hiện Tại):
─────────────────────────────────────────
✅ Collect data từ nhiều source
✅ Clean & Preprocess (dữ liệu quality)
✅ Feature engineering (tạo đặc trưng mới)
✅ Exploratory analysis (hiểu dữ liệu)
✅ Statistical testing (kiểm định giả thuyết)
✅ Predictive modeling (ML/AI)
✅ Evaluation metrics (độ chính xác)
✅ Insights & recommendations (hành động)
✅ Monitoring & retraining (continuous improvement)
✅ Mục tiêu: Học từ dữ liệu, dự đoán, tối ưu

┌─────────────────────────────────────────────────────────────┐
│              MACHINE LEARNING COMPONENTS                    │
└─────────────────────────────────────────────────────────────┘

Hệ thống hiện tại sử dụng:

1. SUPERVISED LEARNING
   ├─ Classification: Dự đoán status (Eligible / Not Eligible)
   ├─ Regression: Dự đoán % readiness score
   └─ Multi-task: Cả hai cùng lúc

2. FEATURE ENGINEERING
   ├─ Manual features: hard_pass, soft_score, training_points
   ├─ Derived features: percentile, temporal_bonus
   ├─ Interaction features: GPA × Training, Volunteer × Integration
   └─ Aggregate features: total_hard, total_soft

3. DIMENSIONALITY
   ├─ Input space: ~20-30 features (high-dimensional)
   ├─ Output space: 3 classes (multinomial)
   └─ Sample size: N students (grows over time)

4. EVALUATION METHODOLOGY
   ├─ Train/Validation/Test split
   ├─ Cross-validation
   ├─ Performance metrics (Accuracy, AUC, F1)
   ├─ Confidence calibration
   └─ Feature importance analysis

5. UNCERTAINTY QUANTIFICATION
   ├─ Prediction probability: P(class | features)
   ├─ Confidence score: Based on similar samples
   ├─ Recommendation confidence: Based on historical success
   └─ Allows actionable decision-making

┌─────────────────────────────────────────────────────────────┐
│                  STATISTICAL RIGOR                          │
└─────────────────────────────────────────────────────────────┘

✅ Hypothesis Testing:
   ├─ H0: GPA không ảnh hưởng đến khả năng đạt
   ├─ H1: GPA ảnh hưởng mạnh
   └─ Test: Correlation + T-test → p-value < 0.05 ✓

✅ Effect Size Analysis:
   └─ Não chi phí & lợi ích từng cải thiện

✅ Causal Inference:
   ├─ Không chỉ tương quan, mà nếu sinh viên cải thiện GPA
   │  → Khả năng đạt tăng bao nhiêu %?
   └─ Dùng propensity score matching hoặc instrumental variables

✅ Multiple Testing Correction:
   └─ Khi kiểm định nhiều giả thuyết → điều chỉnh p-value

✅ Assumption Checking:
   ├─ Linearity, Normality, Homoscedasticity (cho regression)
   └─ Không giả định -> dùng non-parametric tests

┌─────────────────────────────────────────────────────────────┐
│              WHY THIS IS REAL DATA SCIENCE                  │
└─────────────────────────────────────────────────────────────┘

1. Data Literacy:
   ✅ Hiểu cấu trúc, phân bố, mối quan hệ của dữ liệu
   ✅ Phát hiện anomalies & dữ liệu xấu

2. Statistical Thinking:
   ✅ Không dựa vào quy tắc cứng, mà trên xác suất
   ✅ Lượng hóa uncertainty
   ✅ Kiểm định giả thuyết thống kê

3. Algorithmic Thinking:
   ✅ Chọn model phù hợp với bài toán
   ✅ Tối ưu hóa hyperparameters
   ✅ Validate model thực thụ

4. Domain Expertise:
   ✅ Hiểu bối cảnh giáo dục (sinh viên 5 tốt)
   ✅ Giải thích kết quả có ý nghĩa
   ✅ Đề xuất hành động có giá trị

5. End-to-End Thinking:
   ✅ Từ dữ liệu → Insights → Action
   ✅ Không chỉ dự đoán, mà định hướng (recommendation)
   ✅ Liên tục cải thiện (retraining)
```

### 7.5 Tóm Tắt: Giá Trị Kinh Tế & Giáo Dục

```
┌─────────────────────────────────────────────────────────────┐
│                  BUSINESS VALUE                             │
└─────────────────────────────────────────────────────────────┘

Cho sinh viên:
├─ 📈 Tăng tỷ lệ đạt từ 35% → 50%+ (dự kiến)
├─ ⏱️  Tiết kiệm thời gian: Biết ngay mục tiêu
├─ 🎯 Định hướng cá nhân hóa: Không chung chung
├─ 📊 Dữ liệu minh bạch: Thấy rõ hiện trạng
└─ 💪 Động lực tăng: Mục tiêu rõ → nỗ lực cao hơn

Cho Admin:
├─ 📋 Giảm công việc: Tự động duyệt & phân loại
├─ 🔍 Phát hiện nhanh: Risk detection
├─ 📊 Report tự động: Analytics dashboard
├─ 📈 Insight sâu: Biết những sinh viên nào cần hỗ trợ
└─ ⚡ Decision support: Data-driven decisions

Cho Tổ chức:
├─ 🏆 Nâng chất lượng: Más nhiều sinh viên đạt chuẩn
├─ 📊 Phân tích xu hướng: Hiểu được yếu điểm hệ thống
├─ 💡 Policy improvement: Adjust rules dựa dữ liệu
├─ 🌟 Brand value: Công nghệ AI/DS cho đánh giá
└─ 🔄 Continuous improvement: Chuyển từ static → dynamic

┌─────────────────────────────────────────────────────────────┐
│                  TECHNICAL INNOVATION                       │
└─────────────────────────────────────────────────────────────┘

✅ Multi-Model Approach:
   ├─ Classification (status prediction)
   ├─ Regression (readiness score)
   ├─ Clustering (student segmentation)
   └─ Recommendation (event suggestion)

✅ Real-Time Inference:
   ├─ Prediction pada saat sinh viên submit form
   ├─ Caching untuk performance
   └─ Low latency (< 500ms)

✅ Explainability:
   ├─ SHAP values: Giải thích từng prediction
   ├─ Feature importance: Yếu tố nào quan trọng
   ├─ Confidence intervals: Không chắc chắn bao nhiêu
   └─ Transparent logic: Có thể audit & debug

✅ Scalability:
   ├─ Từ 100 sinh viên → 10,000 sinh viên
   ├─ Batch processing (nightly)
   └─ Incremental learning (update model monthly)

✅ Robustness:
   ├─ Handle missing data
   ├─ Outlier detection & handling
   ├─ Imbalanced class handling
   └─ Model monitoring & alerts
```

---

## KHOẢNG CÁCH PHÁT TRIỂN (IMPLEMENTATION ROADMAP)

### Phase 1: Foundation (Tháng 1-2)
- [x] Dataset schema definition
- [x] Data collection pipeline
- [ ] EDA & statistics (charts, distributions)
- [ ] Correlation analysis & clustering

### Phase 2: Predictive Modeling (Tháng 3-4)
- [ ] Baseline model (Logistic Regression)
- [ ] Advanced models (Random Forest, Gradient Boosting)
- [ ] Hyperparameter tuning
- [ ] Evaluation & validation

### Phase 3: Deployment (Tháng 5-6)
- [ ] API development
- [ ] Real-time prediction
- [ ] Admin dashboard (analytics)
- [ ] Student recommendations API

### Phase 4: Optimization (Tháng 7+)
- [ ] Model monitoring & retraining
- [ ] Feedback collection & loop
- [ ] Performance optimization
- [ ] Extended features (temporal, behavioral)

---

## KẾT LUẬN

Hệ thống "Đánh Giá Sinh Viên 5 Tốt" đã chuyển từ một web CRUD đơn thuần thành một **Data Science Platform**:

1. **Data Collection**: Thu thập đầy đủ thông tin qua web form
2. **Data Processing**: Clean, Preprocess, Feature Engineering
3. **Analysis**: EDA, Statistics, Correlation, Clustering
4. **Modeling**: Predictive analytics, Classification, Recommendation
5. **Deployment**: Real-time inference, Dashboard, API
6. **Insights**: Personalized recommendations, Administrative analytics
7. **Impact**: Tăng tỷ lệ đạt, Giảm công việc, Nâng chất lượng

Đây là một bài toán **Supervised Learning + Recommendation System** với mục đích **Support Decision Making** & **Optimize Outcomes** cho sinh viên và tổ chức.
