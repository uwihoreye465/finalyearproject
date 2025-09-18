# 🧪 Manual Test - Auto-Victim Linking

## ✅ **FIXED BEHAVIOR:**

**Before:** Criminal records required manual `vic_id` or would fail
**After:** Criminal records automatically link to existing victims

---

## **Step 1: Create Victim First**

```bash
curl -X POST http://localhost:6000/api/v1/victims \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "first_name": "Test",
    "last_name": "Victim", 
    "phone": "+250788123456",
    "address_now": "Kigali City"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "vic_id": 15,  // ✅ Note this ID
    "first_name": "Test",
    "last_name": "Victim"
  }
}
```

---

## **Step 2: Create Criminal Record (AUTO-LINKING)**

```bash
curl -X POST http://localhost:6000/api/v1/criminal-records \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "id_type": "indangamuntu_yumunyarwanda",
    "id_number": "1199087654321000", 
    "phone": "+250788999888",
    "address_now": "Kigali, Gasabo District",
    "crime_type": "Theft",
    "description": "Stole money from market"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "cri_id": 25,
    "crime_type": "Theft",
    "vic_id": 15,  // ✅ Automatically linked to victim!
    "id_number": "1199087654321000"
  }
}
```

---

## **Step 3: Test With NO Victims (Error Case)**

If you try to create criminal record with NO victims in database:

```bash
curl -X POST http://localhost:6000/api/v1/criminal-records \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "id_type": "passport",
    "id_number": "UK123456789",
    "phone": "+250788999777",
    "address_now": "Kigali",
    "crime_type": "Fraud"
  }'
```

**Expected Error:**
```json
{
  "success": false,
  "message": "No victims found in database. A victim must be registered before creating criminal records. Please provide victim_info to create the first victim.",
  "workflow": {
    "step_1": "Create victim first",
    "step_2": "Then create criminal record"
  }
}
```

---

## **Step 4: Create Criminal Record with Auto-Victim Creation**

```bash
curl -X POST http://localhost:6000/api/v1/criminal-records \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "id_type": "passport",
    "id_number": "UK123456789",
    "phone": "+250788999777",
    "address_now": "Kigali",
    "crime_type": "Fraud",
    "victim_info": {
      "first_name": "Auto",
      "last_name": "Created",
      "phone": "+250788555666"
    }
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "cri_id": 26,
    "crime_type": "Fraud", 
    "vic_id": 16,  // ✅ Auto-created victim linked!
    "id_number": "UK123456789"
  }
}
```

---

## **🎯 KEY IMPROVEMENTS:**

1. **✅ Auto-Linking**: Criminal records now automatically link to most recent victim
2. **✅ Smart Fallback**: If no victims exist, clear error message with instructions
3. **✅ Flexible Input**: Can provide `vic_id`, `victim_info`, or use auto-linking
4. **✅ Database Integrity**: vic_id is NEVER null anymore

## **💡 What Fixed the Issue:**

The system now:
- First searches for existing victims in database
- Automatically links to most recent victim if found
- Provides clear guidance if no victims exist
- Supports manual victim creation via `victim_info`
- Validates both `vic_id` and `victim_info` input formats

**Result: No more "victim required" errors when victims exist in database!** ✅
