# PREDICTIVE ANALYTICS & RECOMMENDATION ENGINE

**Hướng dẫn triển khai mô hình dự đoán & hệ thống gợi ý cho SV5T**

---

## 1. OVERVIEW: CÁC BƯỚC PHÁT TRIỂN MÔ HÌNH DỰ ĐOÁN

```
Phase 1: Data Collection (Hiện tại)
  └─ Sinh viên nhập thông tin → Lưu DB
  └─ Output: Dataset records với 25+ features

Phase 2: Exploratory Analysis (Đã làm)
  ├─ Descriptive statistics
  ├─ Correlation analysis
  ├─ Clustering & segmentation
  └─ Output: Insights từ dữ liệu hiện có

Phase 3: Predictive Modeling (Đề xuất)
  ├─ Chọn model (Logistic Regression, Random Forest, ...)
  ├─ Train/Validation/Test split
  ├─ Hyperparameter tuning
  ├─ Cross-validation
  └─ Output: Model với accuracy ~88-92%

Phase 4: Deployment (Đề xuất)
  ├─ REST API: /api/predict
  ├─ Real-time inference
  ├─ Caching strategy
  └─ Output: Predictions trong <500ms

Phase 5: Monitoring & Retraining (Đề xuất)
  ├─ Collect predictions vs actual outcomes
  ├─ Detect model drift
  ├─ Retrain monthly/quarterly
  └─ Output: Model performance tracking
```

---

## 2. BƯỚC 1: DATA PREPARATION

### 2.1 Tập Dữ Liệu Đào Tạo (Training Set)

**Thời gian**: 2022-2023 (ít nhất 200-300 sinh viên)

```
Input Features (20-25):
├─ Demographics: faculty, student_type, academic_year
├─ Hard Criteria: hard_ethics, hard_study, hard_physical, ...
├─ Soft Criteria: soft_ethics_score, soft_study_score, ...
├─ Profile: gpa, training_points, volunteer_days
├─ Engagement: evidences_count, evidence_approval_rate
└─ Temporal: submission_timeline_days, last_update_recency

Output Label (Target):
├─ Classification: final_status (ELIGIBLE / ALMOST_READY / NOT_ELIGIBLE)
└─ Regression: completion_percent (0-100)
```

### 2.2 Data Splitting

```
Total: N students

Training: 70% → để train model
Validation: 15% → để tune hyperparameters
Test: 15% → để đánh giá final performance

IMPORTANT: Split by TIME (không random)
├─ Train: Jan-Aug 2023
├─ Val:   Sep 2023
└─ Test:  Oct-Dec 2023 + Jan 2024

Lý do: Tránh data leakage (future info)
```

### 2.3 Xử Lý Dữ Liệu Thiếu & Ngoại Lệ

```
Missing Values:
├─ submission_timeline_days: Fill with median (40 days)
├─ last_update_recency: Fill with 999 (không update)
└─ evidence_approval_rate: Fill with 0 (không có minh chứng)

Outliers:
├─ GPA = 0 (invalid) → Impute với group mean
├─ Volunteer = 365 days (unrealistic) → Cap at 100 days
├─ Training points > 100 → Cap at 100
└─ Detect & Flag: Zscore > 3 → Review manually

Class Imbalance (nếu có):
├─ ELIGIBLE: 45%, ALMOST_READY: 30%, NOT_ELIGIBLE: 25%
├─ Strategy: SMOTE hoặc Class weights
└─ Metric: F1-score thay cho Accuracy
```

---

## 3. BƯỚC 2: FEATURE ENGINEERING

### 3.1 Feature Selection

**Theo importance (từ EDA):**

```
Top Features to Use:
1. hard_study ★★★★★ (Weight: 25%)
2. soft_integration_score ★★★★ (Weight: 15%)
3. hard_volunteer ★★★★ (Weight: 12%)
4. gpa ★★★ (Weight: 11%)
5. soft_study_score ★★★ (Weight: 8%)
6. training_points ★★★ (Weight: 7%)
7. hard_ethics ★★ (Weight: 6%)
8. volunteer_days ★★ (Weight: 5%)
9. evidence_approval_rate ★★ (Weight: 5%)
10. submission_recency ★★ (Weight: 5%)

Skip:
❌ hard_physical (quá khó, correlation thấp)
❌ student_id, mssv (không có predictive power)
❌ Có thể bỏ soft_physical_score (luôn = 0)
```

### 3.2 Feature Transformation

```
Numerical Features:
├─ Standardization (Z-score normalization):
│  ├─ GPA: (x - 3.4) / 0.3 → mean = 0, std = 1
│  ├─ Training: (x - 90) / 8
│  └─ Volunteer: log(x + 1) → handle right-skew
│
├─ Scaling:
│  ├─ MinMax scaling cho tree models: không cần
│  └─ StandardScaler cho linear models: cần
│
└─ Binning (Optional):
   └─ GPA → 4 bins: <3.0, 3.0-3.4, 3.4-3.7, ≥3.7

Categorical Features:
├─ Faculty: One-hot encoding
│  ├─ faculty_kinh_te: 0/1
│  ├─ faculty_ky_thuat: 0/1
│  ├─ faculty_y_khoa: 0/1
│  └─ faculty_other: dropped (reference)
│
└─ Student Type: Label encoding
   └─ student_type_university: 0/1

Interaction Features (Optional):
├─ gpa × training (Ethical student who studies)
├─ volunteer_days × soft_integration_score
└─ hard_passed_count × soft_total_score
```

### 3.3 Feature Normalization

```
Trước Training:
├─ Standardize: (x - μ) / σ
├─ Fit scaler trên TRAINING data
├─ Apply same scaler tới VAL & TEST data
│  (IMPORTANT: Tránh data leakage)
└─ Save scaler → dùng lại khi dự đoán new students

Code Pattern:
```python
from sklearn.preprocessing import StandardScaler

scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)  # Fit + Transform
X_val_scaled = scaler.transform(X_val)          # Transform only
X_test_scaled = scaler.transform(X_test)        # Transform only

# Later, for new student:
new_student_scaled = scaler.transform(new_student)
prediction = model.predict(new_student_scaled)
```
```

---

## 4. BƯỚC 3: MODEL SELECTION & TRAINING

### 4.1 Candidate Models

```
1. LOGISTIC REGRESSION (Baseline)
   ├─ Pros: Simple, interpretable, fast
   ├─ Cons: Assumes linearity
   ├─ Time to train: < 1 second
   ├─ Expected Accuracy: 80-85%
   └─ Use when: Need fast inference & explainability

2. RANDOM FOREST (Recommended)
   ├─ Pros: Non-linear, robust, feature importance
   ├─ Cons: Slower inference, black box
   ├─ Time to train: 10-30 seconds (100 trees)
   ├─ Expected Accuracy: 88-92%
   └─ Use when: Want better performance + feature importance

3. GRADIENT BOOSTING (XGBoost/LightGBM)
   ├─ Pros: Best performance, handles imbalance well
   ├─ Cons: Complex, risk of overfitting
   ├─ Time to train: 30-60 seconds
   ├─ Expected Accuracy: 90-94%
   └─ Use when: Max performance is priority

4. NEURAL NETWORK (Deep Learning)
   ├─ Pros: Very flexible, can learn complex patterns
   ├─ Cons: Needs more data, slow training, black box
   ├─ Time to train: 1-5 minutes
   ├─ Expected Accuracy: 91-95%
   └─ Use when: Have 1000+ samples & computation budget

Recommended: Random Forest (sweet spot)
```

### 4.2 Hyperparameter Tuning (Random Forest)

```
Parameters to Tune:

n_estimators: [50, 100, 150, 200]
├─ More trees → better, nhưng chậm hơn
└─ Recommended: 100

max_depth: [5, 10, 15, None]
├─ Deeper tree → có thể overfit
└─ Recommended: 10

min_samples_split: [2, 5, 10]
├─ Cao hơn → simpler model, ít overfit
└─ Recommended: 5

min_samples_leaf: [1, 2, 4]
├─ Cao hơn → smoother predictions
└─ Recommended: 2

max_features: ['sqrt', 'log2']
├─ Bao nhiêu features xem ở mỗi split
└─ Recommended: 'sqrt'

Tuning Strategy:
├─ Grid Search: Thử tất cả combinations (lâu)
├─ Random Search: Random sample (nhanh hơn)
└─ Bayesian Optimization: Smart search (tốt nhất)

Validation: 5-fold Cross-Validation
```

---

## 5. BƯỚC 4: MODEL EVALUATION

### 5.1 Classification Metrics

```
Confusion Matrix:
                 Predicted
              Eligible  Other
Actual  Eligible   TP      FN
        Other      FP      TN

Key Metrics:

1. ACCURACY = (TP + TN) / Total
   └─ Tổng % dự đoán đúng
   └─ Problem: Không tốt khi imbalanced classes

2. PRECISION = TP / (TP + FP)
   └─ Của những dự đoán "Eligible", % đúng bao nhiêu?
   └─ High precision = ít false positives
   └─ Important: Chúng ta không muốn report sai

3. RECALL = TP / (TP + FN)
   └─ Của những sinh viên thực tế "Eligible", % được dự đoán?
   └─ High recall = ít false negatives
   └─ Important: Không muốn bỏ sót

4. F1-SCORE = 2 × (Precision × Recall) / (Precision + Recall)
   └─ Trung bình hòa của P & R
   └─ Tốt khi classes imbalanced

5. ROC-AUC = Area under ROC Curve
   └─ Đo khả năng phân biệt giữa classes
   └─ 0.5 = random, 1.0 = perfect
   └─ Target: ≥ 0.90

Example Results:
┌─────────────────────────────────────┐
│ Model: Random Forest                │
├─────────────────────────────────────┤
│ Accuracy:  90.5%                    │
│ Precision: 89.2%                    │
│ Recall:    88.7%                    │
│ F1-Score:  88.9%                    │
│ ROC-AUC:   0.923                    │
└─────────────────────────────────────┘
```

### 5.2 Per-Class Performance

```
Class-wise Metrics:

                Precision  Recall   F1-Score  Support
ELIGIBLE         92%        90%      91%       45
ALMOST_READY     85%        82%      84%       30
NOT_ELIGIBLE     88%        91%      90%       25

Interpretation:
├─ ELIGIBLE: Model tốt (high P & R)
├─ ALMOST_READY: Model yếu (recall thấp → bỏ sót)
└─ NOT_ELIGIBLE: Model tốt

Action: Cân nhắc giảm threshold để tăng recall cho ALMOST_READY
```

### 5.3 Feature Importance

```
Feature Importance (Random Forest):

1. hard_study              25.3%  ★★★★★
2. soft_integration_score  14.8%  ★★★★
3. gpa                     12.1%  ★★★
4. hard_volunteer          11.5%  ★★★
5. soft_study_score        10.2%  ★★★
6. training_points          8.4%  ★★
7. hard_ethics              7.2%  ★★
8. volunteer_days           5.8%  ★
9. evidence_approval_rate   3.2%  ★
10. submission_recency      1.4%  

Top 3: hard_study + soft_integration + gpa = 52%
→ Tập trung vào ba yếu tố này → cải thiện 50% outcome
```

---

## 6. BƯỚC 5: DEPLOYMENT & INFERENCE

### 6.1 Model Serving Architecture

```
┌─────────────────────────────────────────────────┐
│          PREDICTION PIPELINE                    │
├─────────────────────────────────────────────────┤
│                                                 │
│ 1. Web Form Input                               │
│    └─ Student data from React component         │
│                                                 │
│ 2. Data Validation                              │
│    └─ Check GPA range, training points, etc.    │
│                                                 │
│ 3. Feature Engineering                          │
│    └─ Create derived features                   │
│                                                 │
│ 4. Feature Scaling                              │
│    └─ Apply saved StandardScaler                │
│                                                 │
│ 5. Model Prediction                             │
│    └─ Load trained model → predict              │
│                                                 │
│ 6. Post-Processing                              │
│    └─ Add confidence, recommendations           │
│                                                 │
│ 7. Cache Result                                 │
│    └─ Store in localStorage (24 hours)          │
│                                                 │
│ 8. Return JSON                                  │
│    └─ Status + probability + confidence         │
│                                                 │
└─────────────────────────────────────────────────┘
```

### 6.2 API Endpoint Design

```
POST /api/predict
├─ Request:
│  {
│    "gpa": 3.5,
│    "training_points": 92,
│    "volunteer_days": 6,
│    "hard_criteria": [1, 1, 0, 1, 1],
│    "soft_criteria": [3, 3, 0, 3, 4],
│    "faculty": "kinh_te",
│    "student_type": "UNIVERSITY"
│  }
│
└─ Response:
   {
     "student_id": "123456",
     "predicted_status": "ELIGIBLE",
     "probabilities": {
       "ELIGIBLE": 0.82,
       "ALMOST_READY": 0.15,
       "NOT_ELIGIBLE": 0.03
     },
     "confidence_score": 0.91,
     "readiness_score_predicted": 78.5,
     "improvement_needs": [
       {
         "criteria": "Physical",
         "urgency": "MEDIUM",
         "estimated_days": 60
       }
     ],
     "success_probability": 0.82,
     "success_if_improved": 0.94,
     "inference_time_ms": 45
   }
```

### 6.3 Caching Strategy

```
Client-side Caching:
├─ Cache key: student_id + current_date
├─ Cache duration: 24 hours
├─ Invalidate when: Form data changed > 10%
└─ Benefit: <100ms response time

Server-side Caching:
├─ Cache layer: Redis (optional)
├─ TTL: 6 hours
├─ Eviction: LRU (Least Recently Used)
└─ Benefit: Reduce model inference load

Invalidation Triggers:
├─ Manual: User clicks "Recalculate"
├─ Automatic: 24 hours passed
├─ On data change: Major form update
└─ On model update: New model deployed
```

---

## 7. BƯỚC 6: IMPROVEMENT RECOMMENDATION ENGINE

### 7.1 Algorithm: What to Improve?

```
Algorithm prioritizeImprovements(student_profile):
    
    improvements = []
    
    for each criteria in [study, volunteer, ethics, physical, integration]:
        
        if not student.hard_pass[criteria]:
            
            // 1. Calculate deficit
            deficit = threshold[criteria] - current[criteria]
            
            // 2. Look at similar students who improved
            improved_cohort = filter(
                historical_data,
                criteria: criteria,
                before_status: FAILED,
                after_status: PASSED
            )
            
            // 3. Estimate effort needed
            effort_days = analyze_timeline(improved_cohort)
            effort_percent = analyze_intensity(improved_cohort)
            
            // 4. Assess urgency
            if criteria == 'study':
                urgency = 'HIGH'          // Hardest to improve
                recommend_urgently = true
            elif criteria in ['volunteer', 'ethics']:
                urgency = 'MEDIUM'
                recommend_urgently = false
            else:
                urgency = 'LOW'
            
            // 5. Attach evidence
            success_rate = len(improved_cohort) / len(total_cohort)
            
            improvements.append({
                criteria: criteria,
                deficit: deficit,
                urgency: urgency,
                estimated_days: effort_days,
                success_rate: success_rate,
                related_events: recommendEvents(criteria)
            })
    
    return improvements.sortBy('urgency', 'deficit')
```

### 7.2 Event Recommendation System

```
Algorithm: Score Events for Student

for each event in available_events:
    
    relevance_score = 0
    
    // 1. Relevance to needed criteria
    for criteria in event.supported_categories:
        if student.hard_pass[criteria] == FALSE:
            relevance_score += 40    // Very relevant
        elif student.soft[criteria] < 6:
            relevance_score += 20    // Somewhat relevant
        else:
            relevance_score += 5     // Nice to have
    
    // 2. Timing
    days_until = (event.date - today).days
    if days_until in [0, 30]:
        time_score = 40    // Urgent
    elif days_until in (30, 90]:
        time_score = 25    // Soon
    else:
        time_score = 5     // Later
    
    // 3. Historical success rate
    similar_students_who_attended = filter(
        historical_data,
        attended_event: event.id,
        similar_profile: student
    )
    success_rate = len(improved) / len(attended)
    success_score = success_rate * 20
    
    // 4. Combine scores
    event.recommendation_score = (
        0.5 × relevance_score +
        0.3 × time_score +
        0.2 × success_score
    )

// Return top 3 events
return events.sortBy('recommendation_score').take(3)
```

Example Output:

```
Top Recommended Events for Student A:

1. 🎯 Khóa cải thiện GPA (Score: 95/100)
   ├─ Cần thiết cho: Study Hard (GPA cần +0.3)
   ├─ Thời gian: 15 tháng 2 năm 2025 (10 ngày nữa)
   ├─ Thành công rate: 78% (từ 45 sinh viên tương tự)
   ├─ Ước tính thời gian: 8 tuần
   └─ [Đăng ký] [Chi tiết]

2. 🏃 Hội thao - Kiểm tra SV Khỏe (Score: 82/100)
   ├─ Cần thiết cho: Physical Hard
   ├─ Thời gian: 1 tháng 6 năm 2025
   ├─ Thành công rate: 92%
   ├─ Ước tính thời gian: 2 tháng training
   └─ [Đăng ký] [Chi tiết]

3. 🤝 Chiến dịch Tình nguyện Hè (Score: 76/100)
   ├─ Cần thiết cho: Volunteer Hard + Soft
   ├─ Thời gian: 1 tháng 7 năm 2025
   ├─ Thành công rate: 95%
   ├─ Ước tính thời gian: 3 tuần
   └─ [Đăng ký] [Chi tiết]
```

---

## 8. BƯỚC 7: MONITORING & RETRAINING

### 8.1 Model Performance Monitoring

```
Metrics to Track:

1. Prediction Accuracy (Monthly)
   ├─ Actual outcomes vs predicted
   ├─ Alert threshold: Accuracy drops < 85%
   └─ Action: Investigate root cause or retrain

2. Model Drift Detection
   ├─ Feature distribution change (Kolmogorov-Smirnov test)
   ├─ Prediction distribution change
   ├─ Alert: p-value < 0.05 (significant drift)
   └─ Action: Retrain or update thresholds

3. Calibration
   ├─ P(Eligible) = 0.8 → Actual eligible rate ≈ 80%
   ├─ Check: Brier score, Expected Calibration Error
   └─ Alert: Significant miscalibration
   └─ Action: Apply calibration (Platt scaling, etc.)

4. Fairness Metrics
   ├─ Accuracy per faculty (should be similar)
   ├─ Accuracy per student type
   ├─ Alert: Bias detected (difference > 5%)
   └─ Action: Retrain with fairness constraints

5. Latency
   ├─ Inference time (should be < 500ms)
   ├─ P95 latency (95% of requests)
   └─ Alert: > 1000ms
   └─ Action: Optimize or use faster model
```

### 8.2 Retraining Schedule

```
Trigger-based Retraining:
├─ Immediate: Accuracy drops below 80% (emergency)
├─ Weekly: Collect new data, check drift
├─ Monthly: Full retraining with recent data
├─ Quarterly: Major review, ablation studies
└─ Yearly: Complete overhaul, new features

Retraining Pipeline:

1. Data Collection (Recent 3 months)
   └─ New students + validation of predictions

2. Validation (Against test set)
   └─ Ensure old predictions still hold

3. Model Training
   └─ Retrain on historical + new data

4. Evaluation
   └─ Validate on hold-out test set

5. Comparison
   ├─ New model vs old model
   ├─ Is performance better?
   └─ Any fairness issues?

6. Deployment Decision
   ├─ If better: Deploy immediately
   ├─ If worse: Investigate & debug
   └─ If same: Keep current (avoid churn)

7. Monitoring
   └─ Track new model performance closely
```

### 8.3 Feedback Loop

```
Collecting Ground Truth:

When to collect:
├─ End of year: After final decision made
├─ Interview: Admin confirms eligibility
├─ Appeal: Student challenges decision
└─ Academic year end: Comprehensive review

Data to collect:
├─ actual_status (what really happened)
├─ confidence_score (original prediction)
├─ improvement_notes (what student actually did)
└─ feedback (student satisfaction with recommendations)

Using Feedback:

1. Calculate prediction error
   └─ error = predicted_status ≠ actual_status

2. Analyze error patterns
   ├─ Which students did we get wrong?
   ├─ What was common? (low GPA, late submission, etc.)
   └─ What did we miss?

3. Identify systematic biases
   ├─ Over-predicting certain faculty?
   ├─ Under-predicting certain student type?
   └─ Seasonal patterns?

4. Update model accordingly
   └─ Add features, adjust weights, or retrain
```

---

## 9. CONFIDENCE CALIBRATION

### 9.1 Why Confidence Matters

```
Prediction: "Student A → ELIGIBLE (confidence: 82%)"
Meaning: "Dựa trên profile, 82 lần nộp hồ sơ giống vậy,
         khoảng 82 lần được chọn."

Uses:
├─ Low confidence (< 60%): Flag for manual review
├─ Medium confidence (60-80%): Show with caveats
├─ High confidence (> 80%): Trust the prediction

How to Calculate Confidence:

1. From Similar Students (KNN-based)
   └─ Find 10-20 similar students
   └─ Count how many achieved target status
   └─ confidence = (# achieved) / (total similar)

2. From Prediction Probability
   └─ model.predict_proba() gives P(class)
   └─ confidence = max(P(ELIGIBLE), P(ALMOST_READY), P(NOT_ELIGIBLE))
   └─ Too high probability = overfitting (recalibrate)

3. From Model Uncertainty
   └─ Tree-based: Entropy in leaf node
   └─ NN: MC Dropout
   └─ Ensemble: Variance across models

Recommendation:
├─ Use combination of 1 + 2
├─ Calibrate using Platt scaling
└─ Validate on separate holdout set
```

### 9.2 Confidence Bands

```
Display in UI:

Very Confident (> 85%)
├─ 📈 Dự đoán này rất tin cậy (88% sinh viên tương tự → đạt)
├─ Color: Green ✓
└─ Action: Trust the prediction

Moderately Confident (65-85%)
├─ 📊 Dự đoán này khá tin cậy (78% sinh viên tương tự → đạt)
├─ Color: Orange ⚠️
└─ Action: Consider alternatives, get more evidence

Low Confidence (< 65%)
├─ ❓ Dự đoán không chắc chắn (55% sinh viên tương tự → đạt)
├─ Color: Red ✗
└─ Action: Need manual review or more information
```

---

## 10. CHUYÊN MỤC: CÔNG THỨC TÍNH TOÁN CHI TIẾT

### 10.1 Readiness Score (Data-Driven Version)

```
readinessScore(student, faculty) = 

    // Component 1: Hard Criteria (Cơ bản)
    hardScore = 0
    if student.hard_ethics:      hardScore += 14
    if student.hard_study:       hardScore += 20  // Nặng nhất
    if student.hard_physical:    hardScore += 12
    if student.hard_volunteer:   hardScore += 19
    if student.hard_integration: hardScore += 15
    // Subtotal: 0-80 (normalize to 0-60% later)
    
    // Component 2: Soft Criteria (Ưu tiên)
    softScore = 0
    softScore += (student.soft_ethics_score / 6) * 6
    softScore += (student.soft_study_score / 6) * 6   // Faculty-dependent
    softScore += (student.soft_volunteer_score / 6) * 6
    softScore += (student.soft_integration_score / 6) * 6
    // Subtotal: 0-24
    
    // Component 3: Temporal Bonus
    temporalBonus = 0
    if days_since_submission < 30:
        temporalBonus = +3     // Nộp sớm
    if update_frequency >= 3:
        temporalBonus += 2     // Cập nhật thường xuyên
    if days_since_update < 7:
        temporalBonus += 2     // Vẫn hoạt động
    // Subtotal: 0-7
    
    // Component 4: Percentile Adjustment
    similarStudents = findKNN(student, k=20)
    studentPercentile = percentile(student.hardScore, similarStudents)
    percentileAdjust = (studentPercentile / 100) * 6
    // Subtotal: 0-6
    
    // Final Aggregation
    totalScore = (hardScore / 80) * 60 +   // Normalize hard to 60%
                 softScore +                // Already 24%
                 temporalBonus +            // 0-7%
                 percentileAdjust           // 0-6%
    
    return min(totalScore, 100)

Example 1: Student with all hard, no soft
├─ hardScore = 80 → 60%
├─ softScore = 0 → 0%
├─ temporal + percentile = 5%
└─ Total = 65% → ALMOST_READY

Example 2: Student with 4/5 hard, good soft
├─ hardScore = 68 → 51%
├─ softScore = 18 → 18%
├─ temporal + percentile = 6%
└─ Total = 75% → ELIGIBLE
```

### 10.2 Success Probability Formula

```
P(success | student) = α × P_historical + β × P_temporal + γ × P_model

where:

P_historical = success rate của similar students
├─ weight α = 0.6 (most important)
└─ Based on KNN similarity

P_temporal = adjusted by current year trend
├─ weight β = 0.2
├─ If pass rate increasing → boost probability
└─ Formula: P_historical × (1 + trend_factor)

P_model = predicted probability từ ML model
├─ weight γ = 0.2
└─ model.predict_proba()[target_class]

Final:
├─ P(success) = 0.6 × 0.78 + 0.2 × 0.80 + 0.2 × 0.82
├─ P(success) = 0.468 + 0.160 + 0.164
└─ P(success) = 0.792 = 79.2%
```

---

## 11. NEXT STEPS & IMPLEMENTATION TIMELINE

### Phase 1: Immediate (Jan-Feb 2025)
- [x] Finalize dataset schema
- [x] Create analytics service
- [ ] Collect & clean historical data
- [ ] EDA & statistics (validation)

### Phase 2: Short-term (Mar-Apr 2025)
- [ ] Train baseline model (Logistic Regression)
- [ ] Hyperparameter tuning (Random Forest)
- [ ] Evaluation & validation
- [ ] Feature importance analysis

### Phase 3: Medium-term (May-Jun 2025)
- [ ] Develop API endpoints
- [ ] Integrate with React frontend
- [ ] Implement caching
- [ ] Add confidence scoring

### Phase 4: Long-term (Jul-Aug 2025)
- [ ] Deploy to production
- [ ] Monitoring & alerting
- [ ] Feedback collection
- [ ] First retraining cycle

---

## 12. SUCCESS CRITERIA

```
Model Performance:
├─ Accuracy: ≥ 88%
├─ Precision: ≥ 87%
├─ Recall: ≥ 85%
├─ F1-Score: ≥ 0.86
└─ ROC-AUC: ≥ 0.90

System Performance:
├─ Inference time: < 500ms (p95)
├─ Cache hit rate: > 70%
├─ API uptime: 99.9%
└─ Error rate: < 0.1%

Business Impact:
├─ Student satisfaction: > 80% (survey)
├─ Improved eligibility rate: +10% from baseline
├─ Admin workload reduction: 30%
└─ Recommendation acceptance rate: > 60%

Data Quality:
├─ Missing data: < 5%
├─ Outliers: < 2%
├─ Data freshness: < 24 hours old
└─ Validation pass rate: > 98%
```

---

**Phát triển mô hình là một quá trình liên tục. Bắt đầu nhỏ, validate, rồi mở rộng!**
