import { User } from "../models/User.js";
import { Group } from "../models/Group.js";
import { Payment } from "../models/Payment.js";
import { Attendance } from "../models/Attendance.js";
import { dateKey } from "../utils/dates.js";

export const RAW_ADAM_STUDENTS_G1 = [
  // --- Group 1 (A1 New Group) ---
  {
    name: "فقيه يامنى",
    username: "fkih.yamna",
    phone: "0667073976",
    parentPhone: "0667073976",
    paidAmount: 7500,
    assurancePaid: false,
    sessionsAttended: 4,
    lastSessionStatus: "Absent",
    notes: "تم دفع كامل المبلغ 7500 دج"
  },
  {
    name: "شريفي أميمة",
    username: "cherifi.oumaima",
    phone: "0664896581",
    parentPhone: "0664896581",
    paidAmount: 5500,
    assurancePaid: true,
    sessionsAttended: 8,
    lastSessionStatus: "Present",
    notes: "الدفعة 1: 3500 دج + الدفعة 2: 2000 دج + حقوق تسجيل 800 دج"
  },
  {
    name: "بوقاجية أسماء",
    username: "boukadjia.asma",
    phone: "0791892663",
    parentPhone: "0791892663",
    paidAmount: 2000,
    assurancePaid: true,
    sessionsAttended: 5,
    lastSessionStatus: "Absent",
    notes: "الدفعة 1: 2000 دج + حقوق تسجيل 800 دج"
  },
  {
    name: "يوسفي جيهان",
    username: "yousfi.jihan",
    phone: "0558631454",
    parentPhone: "0558631454",
    paidAmount: 3000,
    assurancePaid: false,
    sessionsAttended: 5,
    lastSessionStatus: "Present",
    notes: "الدفعة 1: 3000 دج"
  },
  {
    name: "صفصاف إسكندر",
    username: "safsaf.iskander",
    phone: "0673300390",
    parentPhone: "0673300390",
    paidAmount: 7000,
    assurancePaid: false,
    sessionsAttended: 6,
    lastSessionStatus: "Present",
    notes: "الدفعة 1: 7000 دج"
  },
  {
    name: "طراد دينا",
    username: "trad.dina",
    phone: "0661986093",
    parentPhone: "0661986093",
    paidAmount: 4000,
    assurancePaid: false,
    sessionsAttended: 5,
    lastSessionStatus: "Absent",
    notes: "الدفعة 1: 4000 دج"
  },
  {
    name: "مراح آية",
    username: "merah.aya",
    phone: "0660000001",
    parentPhone: "0660000001",
    paidAmount: 2500,
    assurancePaid: false,
    sessionsAttended: 8,
    lastSessionStatus: "Present",
    notes: "الدفعة 1: 2500 دج"
  },
  {
    name: "مرحباوي أميمة",
    username: "merhabaoui.oumaima",
    phone: "0660000002",
    parentPhone: "0660000002",
    paidAmount: 2500,
    assurancePaid: false,
    sessionsAttended: 8,
    lastSessionStatus: "Present",
    notes: "الدفعة 1: 2500 دج"
  },
  {
    name: "كلبي دعاء",
    username: "kelbi.douaa",
    phone: "0656230032",
    parentPhone: "0656230032",
    paidAmount: 2500,
    assurancePaid: false,
    sessionsAttended: 7,
    lastSessionStatus: "Present",
    notes: "الدفعة 1: 2500 دج"
  },
  {
    name: "حاج عمار نور الهدى",
    username: "hadj.ammar.nour",
    phone: "0776907068",
    parentPhone: "0776907068",
    paidAmount: 7500,
    assurancePaid: true,
    sessionsAttended: 8,
    lastSessionStatus: "Present",
    notes: "خالص كامل المبلغ 7500 دج + حقوق تسجيل 800 دج"
  },
  {
    name: "زيتوني وصال",
    username: "zitouni.ouissal",
    phone: "0665817156",
    parentPhone: "0665817156",
    paidAmount: 7500,
    assurancePaid: true,
    sessionsAttended: 7,
    lastSessionStatus: "Present",
    notes: "خالص كامل المبلغ 7500 دج + حقوق تسجيل 800 دج"
  },
  {
    name: "بلونيس إيناس",
    username: "belounis.ines",
    phone: "0664146581",
    parentPhone: "0664146581",
    paidAmount: 3500,
    assurancePaid: false,
    sessionsAttended: 7,
    lastSessionStatus: "Absent",
    notes: "الدفعة 1: 3500 دج"
  },
  {
    name: "مادي دعاء",
    username: "madi.douaa",
    phone: "0668640119",
    parentPhone: "0668640119",
    paidAmount: 5000,
    assurancePaid: false,
    sessionsAttended: 7,
    lastSessionStatus: "Present",
    notes: "الدفعة 1: 5000 دج"
  },
  {
    name: "يحياوي نزار",
    username: "yahiaoui.nizar",
    phone: "0792001110",
    parentPhone: "0792001110",
    paidAmount: 3500,
    assurancePaid: false,
    sessionsAttended: 8,
    lastSessionStatus: "Present",
    notes: "الدفعة 1: 3500 دج"
  },
  {
    name: "حوابلية تقي",
    username: "houablia.taki",
    phone: "0557506638",
    parentPhone: "0557506638",
    paidAmount: 3500,
    assurancePaid: false,
    sessionsAttended: 8,
    lastSessionStatus: "Present",
    notes: "الدفعة 1: 3500 دج"
  },
  {
    name: "صايفي مريم",
    username: "saifi.meriem",
    phone: "0668019092",
    parentPhone: "0668019092",
    paidAmount: 4000,
    assurancePaid: false,
    sessionsAttended: 4,
    lastSessionStatus: "Present",
    notes: "الدفعة 1: 4000 دج"
  },
  {
    name: "خراط ريتاج",
    username: "kharat.ritedj",
    phone: "0772559452",
    parentPhone: "0772559452",
    paidAmount: 2000,
    assurancePaid: true,
    sessionsAttended: 5,
    lastSessionStatus: "Absent",
    notes: "الدفعة 1: 2000 دج + حقوق تسجيل 800 دج"
  },
  {
    name: "منشري ليلى",
    username: "menchari.leila",
    phone: "0782223487",
    parentPhone: "0782223487",
    paidAmount: 3000,
    assurancePaid: false,
    sessionsAttended: 6,
    lastSessionStatus: "Absent",
    notes: "الدفعة 1: 3000 دج"
  },
  {
    name: "مالكية إيمان",
    username: "malkia.imen",
    phone: "0776780629",
    parentPhone: "0776780629",
    paidAmount: 7500,
    assurancePaid: false,
    sessionsAttended: 7,
    lastSessionStatus: "Absent",
    notes: "خالص كامل المبلغ 7500 دج"
  },
  {
    name: "زوواج نورهان",
    username: "zouadj.nourhane",
    phone: "0655427802",
    parentPhone: "0655427802",
    paidAmount: 2000,
    assurancePaid: true,
    sessionsAttended: 8,
    lastSessionStatus: "Present",
    notes: "الدفعة 1: 2000 دج + حقوق تسجيل 800 دج"
  },
  {
    name: "مالكي حورية",
    username: "malki.houria",
    phone: "0556106016",
    parentPhone: "0556106016",
    paidAmount: 4000,
    assurancePaid: false,
    sessionsAttended: 8,
    lastSessionStatus: "Present",
    notes: "الدفعة 1: 2000 دج + الدفعة 2: 2000 دج"
  },
  {
    name: "مالكي عبد العزيز",
    username: "malki.abdelaziz",
    phone: "0660000003",
    parentPhone: "0660000003",
    paidAmount: 2400,
    assurancePaid: false,
    sessionsAttended: 4,
    lastSessionStatus: "Absent",
    notes: "الدفعة 1: 2400 دج"
  },
  {
    name: "مسني عناق",
    username: "mesni.annak",
    phone: "0556072568",
    parentPhone: "0556072568",
    paidAmount: 4000,
    assurancePaid: true,
    sessionsAttended: 8,
    lastSessionStatus: "Present",
    notes: "الدفعة 1: 2000 دج + الدفعة 2: 2000 دج + حقوق تسجيل 800 دج"
  }
];

export const RAW_ADAM_STUDENTS_G2 = [
  // --- Group 2 (A2 New Group - 8 Sessions Studied) ---
  {
    name: "بوغابة أريج",
    username: "boughaba.aredj",
    phone: "0660000010",
    parentPhone: "0660000010",
    paidAmount: 3000,
    assurancePaid: false,
    sessionsAttended: 8,
    lastSessionStatus: "Present",
    notes: "الدفعة 1: 3000 دج"
  },
  {
    name: "بوغابة ساجدة",
    username: "boughaba.sajida",
    phone: "0660000011",
    parentPhone: "0660000011",
    paidAmount: 3000,
    assurancePaid: false,
    sessionsAttended: 8,
    lastSessionStatus: "Present",
    notes: "الدفعة 1: 3000 دج"
  },
  {
    name: "بوشتة إيناس",
    username: "bouchta.ines",
    phone: "0698879100",
    parentPhone: "0698879100",
    paidAmount: 6000,
    assurancePaid: false,
    sessionsAttended: 8,
    lastSessionStatus: "Absent",
    notes: "الدفعة 1: 2000 دج + الدفعة 2: 2000 دج + الدفعة 3: 2000 دج"
  },
  {
    name: "حوماني ميساء",
    username: "houmani.mayssa",
    phone: "0660000012",
    parentPhone: "0660000012",
    paidAmount: 0,
    assurancePaid: false,
    sessionsAttended: 8,
    lastSessionStatus: "Absent",
    notes: "غير مدفوع"
  },
  {
    name: "جدوعي محمد",
    username: "djedouai.mohamed",
    phone: "0673828365",
    parentPhone: "0673828365",
    paidAmount: 7500,
    assurancePaid: true,
    sessionsAttended: 8,
    lastSessionStatus: "Present",
    notes: "خالص كامل المبلغ 7500 دج + حقوق تسجيل 800 دج"
  },
  {
    name: "أحمد ناصر عبد الحي",
    username: "ahmed.nacer.abdelhay",
    phone: "0555226589",
    parentPhone: "0555226589",
    paidAmount: 3500,
    assurancePaid: false,
    sessionsAttended: 8,
    lastSessionStatus: "Absent",
    notes: "الدفعة 1: 3500 دج"
  },
  {
    name: "بن لعماري محمد",
    username: "benlamari.mohamed",
    phone: "0660000013",
    parentPhone: "0660000013",
    paidAmount: 4000,
    assurancePaid: false,
    sessionsAttended: 8,
    lastSessionStatus: "Absent",
    notes: "الدفعة 1: 4000 دج"
  },
  {
    name: "مراح لؤي",
    username: "merah.louay",
    phone: "0660000014",
    parentPhone: "0660000014",
    paidAmount: 4000,
    assurancePaid: true,
    sessionsAttended: 8,
    lastSessionStatus: "Absent",
    notes: "الدفعة 1: 4000 دج + حقوق تسجيل 800 دج"
  },
  {
    name: "سوشة ميليسا",
    username: "soucha.melissa",
    phone: "0660000015",
    parentPhone: "0660000015",
    paidAmount: 1350,
    assurancePaid: false,
    sessionsAttended: 8,
    lastSessionStatus: "Absent",
    notes: "الدفعة 1: 1350 دج"
  },
  {
    name: "مقراني مروة",
    username: "mokrani.marwa",
    phone: "0660000016",
    parentPhone: "0660000016",
    paidAmount: 0,
    assurancePaid: false,
    sessionsAttended: 8,
    lastSessionStatus: "Absent",
    notes: "غير مدفوع"
  },
  {
    name: "سلطاني وئام",
    username: "soltani.wiam",
    phone: "0660000017",
    parentPhone: "0660000017",
    paidAmount: 3750,
    assurancePaid: true,
    sessionsAttended: 8,
    lastSessionStatus: "Absent",
    notes: "الدفعة 1: 3750 دج (لمدة شهر فقط) + حقوق تسجيل 800 دج"
  },
  {
    name: "حلافي إبراهيم",
    username: "hellafi.ibrahim",
    phone: "0660000018",
    parentPhone: "0660000018",
    paidAmount: 7500,
    assurancePaid: false,
    sessionsAttended: 8,
    lastSessionStatus: "Present",
    notes: "خالص كامل المبلغ 7500 دج"
  },
  {
    name: "كريبات سيرين",
    username: "kribat.sirine",
    phone: "0666736606",
    parentPhone: "0666736606",
    paidAmount: 7500,
    assurancePaid: false,
    sessionsAttended: 8,
    lastSessionStatus: "Present",
    notes: "خالص كامل المبلغ 7500 دج"
  },
  {
    name: "كريبات أروى رنيم",
    username: "kribat.arwa.ranim",
    phone: "0666736607",
    parentPhone: "0666736606",
    paidAmount: 7500,
    assurancePaid: false,
    sessionsAttended: 8,
    lastSessionStatus: "Present",
    notes: "خالص كامل المبلغ 7500 دج"
  },
  {
    name: "سديرة ضحى",
    username: "sedira.dhoha",
    phone: "0664998665",
    parentPhone: "0664998664",
    paidAmount: 7000,
    assurancePaid: false,
    sessionsAttended: 8,
    lastSessionStatus: "Absent",
    notes: "الدفعة 1: 7000 دج"
  },
  {
    name: "سديرة ملاك",
    username: "sedira.malak",
    phone: "0664998664",
    parentPhone: "0664998664",
    paidAmount: 7000,
    assurancePaid: false,
    sessionsAttended: 8,
    lastSessionStatus: "Absent",
    notes: "الدفعة 1: 7000 دج"
  },
  {
    name: "سديرة مريم",
    username: "sedira.meriem",
    phone: "0664998666",
    parentPhone: "0664998664",
    paidAmount: 7000,
    assurancePaid: false,
    sessionsAttended: 8,
    lastSessionStatus: "Absent",
    notes: "الدفعة 1: 7000 دج"
  },
  {
    name: "بوامحولة عبد الله",
    username: "bouamhoula.abdellah",
    phone: "0660000019",
    parentPhone: "0660000019",
    paidAmount: 3500,
    assurancePaid: false,
    sessionsAttended: 8,
    lastSessionStatus: "Absent",
    notes: "الدفعة 1: 3500 دج"
  },
  {
    name: "بوالحراس نزار",
    username: "boualheras.nizar",
    phone: "0697614564",
    parentPhone: "0697614564",
    paidAmount: 2000,
    assurancePaid: false,
    sessionsAttended: 8,
    lastSessionStatus: "Absent",
    notes: "الدفعة 1: 2000 دج"
  },
  {
    name: "صنهاجي أيسر",
    username: "sanhadji.ayser",
    phone: "0660000020",
    parentPhone: "0660000020",
    paidAmount: 7500,
    assurancePaid: true,
    sessionsAttended: 8,
    lastSessionStatus: "Absent",
    notes: "الدفعة 1: 3000 دج + الدفعة 2: 4500 دج (خالص) + حقوق تسجيل 800 دج"
  }
];

const syncStudentList = async (rawList, adam, groupName, groupColor, groupDays, courseLevel = "A1") => {
  let group = await Group.findOne({
    teacher: adam._id,
    $or: [{ name: groupName }, { name: groupName.replace("A2", "A1") }]
  });

  if (!group) {
    group = await Group.create({
      name: groupName,
      description: `Groupe ${groupName} - Enseignant Adam Ameyoud`,
      teacher: adam._id,
      students: [],
      color: groupColor,
      days: groupDays
    });
    console.log(`Created group "${groupName}" for Teacher Adam`);
  } else {
    group.name = groupName;
    group.color = groupColor;
    group.days = groupDays;
  }

  const studentObjectIds = [];
  const todayStr = dateKey();

  for (const raw of rawList) {
    let student = await User.findOne({
      $or: [
        { name: raw.name },
        { username: raw.username },
        { email: raw.username + "@tfc.local" }
      ]
    });

    const attendedCount = raw.sessionsAttended != null ? raw.sessionsAttended : 8;
    const todayStatus = raw.lastSessionStatus || "Present";

    if (!student) {
      student = await User.create({
        role: "student",
        name: raw.name,
        username: raw.username,
        email: raw.username + "@tfc.local",
        password: "Student@12345",
        phone: raw.phone,
        status: "active",
        studentProfile: {
          course: courseLevel,
          teacher: adam._id,
          parentName: raw.name + " (Parent)",
          parentPhone: raw.parentPhone,
          sessionsAttended: attendedCount,
          isStopped: false,
          enrollmentDate: new Date("2026-07-01")
        }
      });
    } else {
      if (!student.studentProfile) student.studentProfile = {};
      student.studentProfile.teacher = adam._id;
      student.studentProfile.course = courseLevel;
      student.studentProfile.sessionsAttended = attendedCount;
      if (raw.parentPhone && !student.studentProfile.parentPhone) {
        student.studentProfile.parentPhone = raw.parentPhone;
      }
      await student.save();
    }

    studentObjectIds.push(student._id);

    // Payments for August & July 2026
    for (const m of ["2026-08", "2026-07"]) {
      const periodName = m === "2026-08" ? "August 2026" : "July 2026";
      let payment = await Payment.findOne({ student: student._id, month: m });

      const tuitionFee = 7500;
      const paid = raw.paidAmount;
      const assuranceFee = 800;
      const isAssurancePaid = Boolean(raw.assurancePaid);

      if (!payment) {
        await Payment.create({
          student: student._id,
          teacher: adam._id,
          month: m,
          period: periodName,
          amount: tuitionFee,
          paidAmount: paid,
          restAmount: Math.max(0, tuitionFee - paid),
          assuranceAmount: assuranceFee,
          assurancePaid: isAssurancePaid,
          assurancePaidAmount: isAssurancePaid ? assuranceFee : 0,
          status: paid >= tuitionFee ? "paid" : paid > 0 ? "partial" : "unpaid",
          notes: raw.notes || "",
          method: "cash",
          recordedBy: adam._id
        });
      } else {
        payment.teacher = adam._id;
        payment.amount = tuitionFee;
        payment.paidAmount = paid;
        payment.restAmount = Math.max(0, tuitionFee - paid);
        payment.assuranceAmount = assuranceFee;
        payment.assurancePaid = isAssurancePaid;
        payment.assurancePaidAmount = isAssurancePaid ? assuranceFee : 0;
        payment.status = paid >= tuitionFee ? "paid" : paid > 0 ? "partial" : "unpaid";
        if (!payment.notes) payment.notes = raw.notes;
        await payment.save();
      }
    }
  }

  group.students = studentObjectIds;
  await group.save();

  return studentObjectIds;
};

export const bootstrapAdamA1 = async () => {
  try {
    // 1. Locate Teacher Adam / Adem
    let adam = await User.findOne({
      role: "teacher",
      $or: [
        { name: { $regex: /adam|ameyoud|adem/i } },
        { email: { $regex: /adam|ameyoud/i } }
      ]
    });

    if (!adam) {
      adam = await User.create({
        role: "teacher",
        name: "Ameyoud Adam",
        email: "adam@tfcschool.dz",
        password: "Teacher@12345",
        status: "active",
        teacherProfile: {
          subject: "English (A1 / A2)",
          contactInfo: "0555000000"
        }
      });
      console.log("Created Teacher Adam account: adam@tfcschool.dz");
    }

    // 2. Sync Group 1 ("A1 New Group")
    const g1StudentIds = await syncStudentList(
      RAW_ADAM_STUDENTS_G1,
      adam,
      "A1 New Group",
      "#3B82F6",
      ["Sunday", "Tuesday", "Thursday"],
      "A1"
    );

    // 3. Sync Group 2 ("A2 New Group" - 8 Sessions Studied)
    const g2StudentIds = await syncStudentList(
      RAW_ADAM_STUDENTS_G2,
      adam,
      "A2 New Group",
      "#8B5CF6",
      ["Monday", "Wednesday", "Saturday"],
      "A2"
    );

    const allAdamStudentIds = [...g1StudentIds, ...g2StudentIds];

    // 4. Update Teacher Adam's assigned students list
    await User.findByIdAndUpdate(adam._id, {
      $addToSet: { "teacherProfile.assignedStudents": { $each: allAdamStudentIds } }
    });

    // 5. Ensure no other teachers have these students assigned
    await User.updateMany(
      { role: "teacher", _id: { $ne: adam._id } },
      { $pullAll: { "teacherProfile.assignedStudents": allAdamStudentIds } }
    );

    // 6. Clean up auto-generated placeholder attendance so unstudied days aren't marked absent
    await Attendance.deleteMany({ teacher: adam._id, source: "manual" });

    console.log(`Successfully bootstrapped ${allAdamStudentIds.length} students across A1 New Group & A2 New Group (8 sessions studied) strictly for Teacher Adam! 🎓`);
  } catch (err) {
    console.error("Error in bootstrapAdamA1:", err);
  }
};
