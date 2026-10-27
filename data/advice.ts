import type { DefenseId } from "../types/defense";
import type { IntegrationCondition } from "./integration-rules";

/**
 * 상황별 조언 문구입니다. 점수를 만들지 않고, 이미 계산된 척도 점수가 조건(높음 ≥ 63, 낮음 ≤ 37)에 맞을 때만 고릅니다.
 * 방법은 연구된 기법(정서 명명, DBT 기술, 인지적 재평가, 행동 활성화, 자기연민 등)을 일상 언어로 옮긴 것이며,
 * 치료나 진단을 대신하지 않습니다. 정서조절곤란(DERS) 점수는 높을수록 그 부분이 어렵다는 뜻입니다.
 */
export const ADVICE_VERSION = "advice-v1";

export const adviceSituations = [
  { id: "anger", title: "화날 때", prompt: "화가 치밀 때 나에게 맞는 다루는 법" },
  { id: "worry", title: "불안할 때", prompt: "걱정이 꼬리를 물 때 마음을 붙잡는 법" },
  { id: "down", title: "가라앉을 때", prompt: "기분이 가라앉고 기운이 없을 때 다시 움직이는 법" },
  { id: "relation", title: "관계가 흔들릴 때", prompt: "가까운 사람과 어긋날 때 나와 관계를 함께 지키는 법" },
  { id: "defense", title: "방어기제 다루기", prompt: "스트레스 앞의 내 습관적 반응을 알아차리고 선택지를 늘리는 법" },
] as const;
export type AdviceSituationId = (typeof adviceSituations)[number]["id"];

export interface AdviceTip {
  id: string;
  situation: AdviceSituationId;
  /** 모든 조건이 맞을 때 보여 줍니다. 비어 있으면 누구에게나 보여 주는 기본 조언입니다. */
  when: readonly IntegrationCondition[];
  title: string;
  steps: readonly string[];
  /** 기법의 이름과 출처 */
  basis: string;
}

const high = (module: IntegrationCondition["module"], scale: string): IntegrationCondition => ({ module, scale, level: "high" });
const low = (module: IntegrationCondition["module"], scale: string): IntegrationCondition => ({ module, scale, level: "low" });

export const adviceTips: readonly AdviceTip[] = [
  // 화날 때
  { id: "anger-impulse-stop", situation: "anger", when: [high("emotion", "impulse")], title: "행동하기 전에 ‘멈춤’ 한 번",
    steps: ["몸이 먼저 움직이려 할 때 그대로 멈춰요. 말, 메시지, 손동작 모두요.", "한 걸음 물러나 숨을 천천히 세 번 쉬어요.", "지금 상황과 내 몸의 느낌을 짧게 살펴본 뒤, 내가 원하는 결과에 맞는 행동을 골라요."],
    basis: "DBT의 STOP 기술(Linehan, 2015) · 충동통제곤란 점수가 높게 나왔어요." },
  { id: "anger-immediate-words", situation: "anger", when: [high("defense", "immediate")], title: "화를 행동 대신 문장으로",
    steps: ["‘네가 늘…’ 대신 ‘…할 때 나는 …했어’로 시작해 보세요.", "바라는 것을 한 가지만 구체적으로 말해요. ‘다음엔 미리 알려 주면 좋겠어.’", "바로 말하기 어려우면 메모로 먼저 적어 두고, 가라앉은 뒤에 전해요."],
    basis: "나-전달법과 자기주장 훈련 · 미성숙한 방어 점수가 높게 나왔어요." },
  { id: "anger-agreeable-early", situation: "anger", when: [high("traits", "agreeableness")], title: "작은 불편을 일찍 말하기",
    steps: ["상대를 배려하느라 넘긴 일이 쌓이면 나중에 한꺼번에 터질 수 있어요.", "불편이 작을 때 가볍게 말해 보세요. ‘이건 조금 아쉬웠어.’", "화를 느끼는 것과 관계를 아끼는 것은 함께 갈 수 있어요."],
    basis: "자기주장 연구 · 친화성이 높게 나왔어요. 공감하는 힘이 큰 만큼 내 몫도 챙겨 주세요." },
  { id: "anger-neuroticism-body", situation: "anger", when: [high("traits", "neuroticism")], title: "생각보다 몸을 먼저 식히기",
    steps: ["감정이 크게 올라올 때는 생각으로 설득하기 어려워요.", "찬물로 얼굴을 적시거나, 5–10분 빠르게 걷거나, 날숨을 들숨보다 길게 쉬어요.", "몸이 가라앉으면 그때 무엇이 나를 화나게 했는지 돌아봐요."],
    basis: "DBT의 TIPP 기술(Linehan, 2015) · 부정적 정서성이 높게 나왔어요." },
  { id: "anger-nonacceptance", situation: "anger", when: [high("emotion", "nonacceptance")], title: "화난 나를 탓하지 않기",
    steps: ["화는 무언가 중요한 것이 침해됐다는 신호예요.", "‘화를 내면 안 돼’ 대신 ‘내가 화가 났구나, 뭔가 중요했나 봐’라고 말해 보세요.", "감정을 인정하는 것과 그 감정대로 행동하는 것은 다른 일이에요."],
    basis: "수용 기반 접근(ACT, DBT) · 정서 비수용성 점수가 높게 나왔어요." },
  { id: "anger-awareness-signals", situation: "anger", when: [high("emotion", "awareness")], title: "화의 초기 신호 알아 두기",
    steps: ["화가 날 때 내 몸에서 먼저 오는 신호를 적어 보세요. 턱이 굳음, 얼굴이 뜨거움, 말이 빨라짐 같은 것이요.", "그 신호가 오면 ‘지금 화가 올라오고 있다’고 속으로 말해요.", "일찍 알아차릴수록 고를 수 있는 행동이 많아져요."],
    basis: "정서 자각 훈련 · 정서 자각 부족 점수가 높게 나왔어요." },
  { id: "anger-avoidance-return", situation: "anger", when: [high("attachment", "attachmentAvoidance")], title: "물러날 때 돌아올 시간 알려 주기",
    steps: ["화가 나면 거리를 두는 것도 좋은 방법이에요.", "다만 ‘지금은 말하기 어려워, 30분 뒤에 다시 얘기하자’처럼 돌아올 때를 알려 주세요.", "그 시간에 다시 돌아오면 거리 두기가 단절이 아니라 쉼이 돼요."],
    basis: "부부 갈등 연구의 타임아웃(Gottman) · 애착회피가 높게 나왔어요." },
  { id: "anger-strength-self-assertion", situation: "anger", when: [low("emotion", "impulse")], title: "이미 가진 힘: 행동을 고르는 힘",
    steps: ["감정이 커도 행동을 고를 수 있는 편이에요.", "그 힘을 ‘참기’보다 ‘분명히 말하기’에 써 보세요.", "화를 차분하게 전할 수 있는 사람은 관계를 더 단단하게 만들 수 있어요."],
    basis: "충동통제곤란 점수가 낮게 나왔어요." },
  { id: "anger-name", situation: "anger", when: [], title: "감정에 이름 붙이기",
    steps: ["‘지금 나는 화가 났다’라고 속으로, 또는 글로 말해요.", "가능하면 더 정확한 말을 찾아요. 억울함, 서운함, 무시당한 느낌처럼요.", "이름을 붙이면 감정의 세기가 조금 줄어드는 경향이 있어요."],
    basis: "정서 명명(affect labeling; Lieberman 외, 2007)" },
  { id: "anger-delay", situation: "anger", when: [], title: "중요한 말은 20분 뒤에",
    steps: ["몸이 흥분한 상태가 가라앉는 데는 보통 20분쯤 걸려요.", "그 사이에는 결정과 답장을 미뤄요.", "가라앉은 뒤에도 같은 말을 하고 싶다면 그때 해도 늦지 않아요."],
    basis: "생리적 각성과 타임아웃 연구(Gottman)" },

  // 불안할 때
  { id: "worry-neuroticism-facts", situation: "worry", when: [high("traits", "neuroticism")], title: "사실과 해석을 나눠 적기",
    steps: ["걱정되는 일을 ‘일어난 사실’과 ‘내가 붙인 해석’ 두 칸으로 나눠 적어요.", "해석마다 ‘다르게 볼 수 있는 설명’을 하나씩 더해 보세요.", "가장 그럴듯한 설명을 골라 다음 행동을 정해요."],
    basis: "인지적 재평가(Gross, 2002) · 부정적 정서성이 높게 나왔어요." },
  { id: "worry-strategies-list", situation: "worry", when: [high("emotion", "strategies")], title: "나만의 회복 목록 미리 만들기",
    steps: ["괜찮을 때, 예전에 조금이라도 나아지게 했던 것 다섯 가지를 적어 두세요.", "불안할 때는 생각하지 말고 목록에서 하나를 골라 해 봐요.", "‘방법이 없다’는 느낌이 들 때 그 목록이 증거가 돼요."],
    basis: "DBT 위기 생존 기술 · 조절전략 접근 점수가 높게 나왔어요." },
  { id: "worry-conscientious-plan", situation: "worry", when: [high("traits", "conscientiousness")], title: "계획하는 힘을 걱정에 쓰기",
    steps: ["걱정을 ‘내가 할 수 있는 것’과 ‘내 손 밖의 것’으로 나눠요.", "할 수 있는 것은 다음 행동 한 가지로 바꿔 일정에 넣어요.", "손 밖의 것은 ‘여기까지 했다’고 적고 내려놓아요."],
    basis: "문제해결 치료 · 성실성이 높게 나왔어요. 계획적인 성향은 불안을 다루는 자원이에요." },
  { id: "worry-anticipation", situation: "worry", when: [high("defense", "adaptive")], title: "미리 그려 보는 힘 활용하기",
    steps: ["다가올 어려움을 떠올리고, 그때 느낄 감정까지 미리 그려 보세요.", "그 순간에 할 말이나 행동을 한 가지 정해 둬요.", "준비는 한 번이면 충분해요. 같은 장면을 계속 돌리면 걱정으로 바뀌어요."],
    basis: "성숙한 방어(예견) · 성숙한 방어 점수가 높게 나왔어요." },
  { id: "worry-time", situation: "worry", when: [], title: "걱정 시간 따로 정하기",
    steps: ["하루 중 15분을 ‘걱정 시간’으로 정해요.", "그 밖의 시간에 걱정이 오면 메모만 하고 ‘이따 걱정 시간에 보자’고 미뤄요.", "걱정 시간에 메모를 보면 이미 덜 중요해진 것들이 있을 거예요."],
    basis: "걱정 미루기(Borkovec 외, 1983)" },
  { id: "worry-ground", situation: "worry", when: [], title: "지금 여기로 돌아오기",
    steps: ["보이는 것 다섯, 들리는 것 넷, 만져지는 것 셋을 차례로 찾아요.", "발바닥이 바닥에 닿은 느낌에 잠시 주의를 둬요.", "걱정은 미래에 있고, 몸은 지금에 있어요."],
    basis: "감각 그라운딩 · 마음챙김 기반 접근" },

  // 가라앉을 때
  { id: "down-goals-tiny", situation: "down", when: [high("emotion", "goals")], title: "일을 5분 단위로 쪼개기",
    steps: ["기분이 가라앉으면 큰 일은 시작하기가 어려워요.", "‘보고서 쓰기’ 대신 ‘파일 열고 제목 쓰기’처럼 5분이면 끝나는 첫 단계만 정해요.", "그 한 단계를 마치면 거기서 멈춰도 충분해요."],
    basis: "행동 활성화의 단계 나누기 · 목표지향행동 점수가 높게 나왔어요." },
  { id: "down-self-compassion", situation: "down", when: [high("emotion", "nonacceptance")], title: "친구에게 하듯 나에게 말하기",
    steps: ["‘지금 힘들구나’ 하고 고통을 알아봐요.", "‘이런 순간은 누구에게나 와’ 하고 혼자가 아님을 떠올려요.", "친한 친구에게 해 줄 말을 나에게 그대로 해 보세요."],
    basis: "자기연민 연습(Neff, 2003) · 정서 비수용성 점수가 높게 나왔어요." },
  { id: "down-clarity-words", situation: "down", when: [high("emotion", "clarity")], title: "‘그냥 안 좋아’를 더 자세히",
    steps: ["지금 느낌에 가장 가까운 단어를 골라 보세요. 지침, 허전함, 실망, 외로움, 막막함 같은 것들이요.", "하나가 아니어도 괜찮아요. 두세 개를 섞어도 돼요.", "감정이 분명해지면 필요한 것도 분명해져요. 지침엔 쉼이, 외로움엔 연결이 필요하죠."],
    basis: "정서 세분화(Barrett 외, 2001) · 정서 명료성 부족 점수가 높게 나왔어요." },
  { id: "down-introvert-one", situation: "down", when: [low("traits", "extraversion")], title: "혼자 회복하되 연결 하나 남기기",
    steps: ["조용한 시간이 회복에 도움이 되는 편이에요. 충분히 쉬어도 괜찮아요.", "다만 연결 하나는 남겨 두세요. 짧은 메시지 한 통이면 돼요.", "혼자 있는 시간이 며칠 넘게 이어지면 한 사람에게 근황을 알려 주세요."],
    basis: "사회적 연결과 기분 연구 · 외향성이 낮게 나왔어요." },
  { id: "down-extravert-people", situation: "down", when: [high("traits", "extraversion")], title: "사람과 움직임으로 에너지 채우기",
    steps: ["사람과 활동에서 에너지를 얻는 편이에요.", "기분이 가라앉을 때 오히려 짧은 약속이나 산책을 잡아 보세요.", "깊은 대화가 아니어도 같이 있는 것만으로 충분할 때가 많아요."],
    basis: "행동 활성화 · 외향성이 높게 나왔어요." },
  { id: "down-strategies-strength", situation: "down", when: [low("emotion", "strategies")], title: "이미 가진 힘: 나아질 길을 아는 것",
    steps: ["속상해도 결국 나아질 방법을 찾는 편이에요.", "예전에 효과 있던 방법을 적어 두면 더 빨리 꺼내 쓸 수 있어요.", "그 방법을 주변 사람과 나누는 것도 좋아요."],
    basis: "조절전략 접근 점수가 낮게 나왔어요." },
  { id: "down-act-first", situation: "down", when: [], title: "기분보다 행동 먼저",
    steps: ["기운이 날 때까지 기다리면 더 오래 걸릴 수 있어요.", "10분이면 되는 작은 활동 하나를 골라요. 창문 열기, 샤워, 집 앞 걷기 같은 것이요.", "하고 나서 기분이 0–10 중 얼마나 바뀌었는지 적어 보세요."],
    basis: "행동 활성화(Jacobson 외, 1996; Dimidjian 외, 2006)" },
  { id: "down-basics", situation: "down", when: [], title: "잠·식사·햇빛 먼저 챙기기",
    steps: ["기분은 몸 상태의 영향을 크게 받아요.", "일어나는 시간을 일정하게, 한 끼는 제때, 낮에 10분 햇빛을 쬐어요.", "세 가지 중 하나만 해도 괜찮아요."],
    basis: "DBT의 PLEASE 기술 · 수면·활동 연구" },

  // 관계가 흔들릴 때
  { id: "relation-anxious-pause", situation: "relation", when: [high("attachment", "attachmentAnxiety")], title: "확인하고 싶을 때 10분 기다리기",
    steps: ["답장이 늦거나 말투가 다르게 느껴지면 불안이 커질 수 있어요.", "연락을 다시 보내기 전에 10분만 기다리며, 지금 떠오른 해석을 적어 보세요.", "그래도 묻고 싶다면 비난 없이 내 마음을 전해요. ‘요즘 연락이 뜸해서 조금 불안했어.’"],
    basis: "애착 연구 기반 정서 초점 접근(Johnson) · 애착불안이 높게 나왔어요." },
  { id: "relation-anxious-impulse", situation: "relation", when: [high("attachment", "attachmentAnxiety"), high("emotion", "impulse")], title: "관계 불안이 행동으로 번지기 전에",
    steps: ["관계가 흔들린다고 느낄 때 감정과 행동이 함께 커질 수 있어요.", "그 순간에 할 행동을 미리 정해 두세요. 예를 들어 ‘보내기 전에 임시 저장’.", "다음 날 아침에 다시 읽고 보낼지 정해요."],
    basis: "실행 의도(if–then 계획; Gollwitzer, 1999) · 애착불안과 충동통제곤란이 함께 높게 나왔어요." },
  { id: "relation-avoidant-small", situation: "relation", when: [high("attachment", "attachmentAvoidance")], title: "작게 한 걸음 다가가기",
    steps: ["가까워질수록 거리를 두고 싶어지는 편일 수 있어요.", "큰 고백 대신 작은 것 하나를 나눠 보세요. 오늘 있었던 일, 고마웠던 점 하나.", "나눈 뒤 어떤 느낌이었는지 살펴보면 내 편안한 거리를 알 수 있어요."],
    basis: "애착 연구 · 애착회피가 높게 나왔어요." },
  { id: "relation-secure-strength", situation: "relation", when: [low("attachment", "attachmentAnxiety"), low("attachment", "attachmentAvoidance")], title: "이미 가진 힘: 편안한 관계의 바탕",
    steps: ["가까운 관계를 비교적 편안하게 느끼는 편이에요.", "갈등이 생겨도 ‘우리는 괜찮을 거야’라는 믿음을 대화의 출발점으로 써 보세요.", "그 안정감은 상대에게도 쉴 곳이 돼요."],
    basis: "애착불안과 애착회피가 모두 낮게 나왔어요." },
  { id: "relation-repair", situation: "relation", when: [], title: "다툰 뒤 먼저 이어 붙이기",
    steps: ["누가 옳았는지보다 관계를 다시 잇는 것이 먼저일 때가 많아요.", "‘아까 내 말이 날카로웠어’처럼 내 몫 하나를 먼저 인정해 보세요.", "작은 회복 시도가 쌓이면 다툼이 관계를 무너뜨리지 않아요."],
    basis: "관계 회복 시도 연구(Gottman)" },
  { id: "relation-needs", situation: "relation", when: [], title: "감정 아래의 바람 찾기",
    steps: ["서운함이나 화 아래에는 보통 바람이 있어요. 존중받고 싶음, 함께하고 싶음 같은 것이요.", "‘나는 사실 …을 바랐어’라는 문장을 완성해 보세요.", "바람을 말하면 상대가 무엇을 하면 되는지 알 수 있어요."],
    basis: "비폭력 대화(Rosenberg) · 정서 초점 접근" },

  // 방어기제 다루기(스타일 수준). 개별 방어는 아래 defenseCare에서 고릅니다.
  { id: "defense-immediate-gap", situation: "defense", when: [high("defense", "immediate")], title: "반응과 행동 사이에 틈 만들기",
    steps: ["강한 스트레스 앞에서 감정을 빠르게 밀어내거나 행동으로 내보내는 편일 수 있어요.", "그 방식이 나를 지키려 했다는 걸 먼저 인정해요.", "다음번엔 반응이 올라올 때 ‘3초 세기’처럼 아주 짧은 틈 하나만 만들어 보세요."],
    basis: "DMRS 위계(Perry, 1990)와 마음챙김 기반 접근 · 미성숙한 방어 점수가 높게 나왔어요." },
  { id: "defense-inhibitory-feel", situation: "defense", when: [high("defense", "inhibitory")], title: "생각 말고 느낌을 한 문장으로",
    steps: ["감정을 마음속에서 바꾸거나 거리를 두어 다루는 편일 수 있어요.", "하루 끝에 ‘오늘 가장 컸던 감정은 …였다’ 한 문장만 적어 보세요.", "분석은 그다음에 해도 늦지 않아요."],
    basis: "표현적 글쓰기(Pennebaker, 1997) · 신경증적 방어 점수가 높게 나왔어요." },
  { id: "defense-adaptive-use", situation: "defense", when: [high("defense", "adaptive")], title: "잘 쓰는 방식을 의도적으로 꺼내기",
    steps: ["성숙한 방어를 자주 쓰는 편이에요.", "힘든 순간에 ‘평소의 나라면 어떻게 했을까?’ 하고 그 방식을 떠올려요.", "잘 됐던 장면을 적어 두면 지칠 때 다시 꺼낼 수 있어요."],
    basis: "성숙한 방어 점수가 높게 나왔어요." },
  { id: "defense-notice", situation: "defense", when: [], title: "없애기보다 알아차리기",
    steps: ["방어기제는 누구에게나 있고, 힘든 순간 나를 지키려는 마음의 방식이에요.", "목표는 없애는 것이 아니라 ‘지금 이 방식을 쓰고 있구나’ 알아차리는 거예요.", "알아차리면 다른 방법을 고를 여지가 생겨요."],
    basis: "방어기제 연구(Vaillant, 1992; Perry, 1990)" },
];

/** 덜 적응적인 방어(DMRS 1–6단계)마다 알아차리고 다룰 수 있는 작은 연습입니다. 두드러진 방어로 나왔을 때 보여 줍니다. */
export const defenseCare: Partial<Record<DefenseId, readonly string[]>> = {
  intellectualization: ["분석이 끝나면 ‘그래서 나는 어떤 기분이지?’를 한 번 더 물어요.", "감정 단어 하나를 골라 문장 끝에 붙여 보세요."],
  isolation: ["사건을 떠올릴 때 몸 어디가 반응하는지 살펴봐요.", "믿을 만한 사람에게 ‘그때 사실 이런 기분이었어’라고 짧게 나눠 보세요."],
  undoing: ["한 말을 바로 거둬들이고 싶을 때, 잠시 그대로 둬 보세요.", "‘내 생각을 말해도 관계는 괜찮을 수 있다’를 작은 일에서 확인해요."],
  repression: ["이유 모를 불편감이 들 때 ‘요즘 마음에 걸리는 일’을 자유롭게 적어 보세요.", "떠오르지 않아도 괜찮아요. 적는 습관이 실마리를 만들어요."],
  dissociation: ["멍해질 때 발바닥, 손의 온도처럼 감각 하나에 주의를 둬요.", "자주 반복되거나 일상에 지장이 있다면 전문가와 이야기해 보기를 권해요."],
  reactionFormation: ["반대로 행동하고 싶어질 때 ‘진짜 느낌은 뭘까?’를 먼저 물어요.", "그 느낌을 행동으로 옮기지 않아도, 나 자신에게는 인정해 주세요."],
  displacement: ["엉뚱한 곳에 짜증이 날 때 ‘원래 누구에게, 무엇 때문에였지?’를 떠올려요.", "원래 대상에게 전할 문장을 메모로 먼저 써 보세요."],
  pseudoAltruism: ["돕기 전에 ‘지금 내게 필요한 건 뭐지?’를 한 번 물어요.", "도움을 거절하는 날을 하나 만들어도 괜찮아요."],
  idealization: ["완벽해 보이는 사람에게서 평범한 면 하나를 찾아봐요.", "좋은 점과 아쉬운 점을 함께 적으면 실망이 덜 커져요."],
  devaluation: ["깎아내리고 싶어질 때 그 아래의 상처나 걱정을 찾아봐요.", "‘그래도 이런 점은 괜찮다’ 하나를 덧붙여 보세요."],
  devaluationOther: ["상대를 깎아내리고 싶어질 때 ‘내가 지금 작아진 느낌인가?’를 물어요.", "상대의 행동과 사람 전체를 나눠 생각해 보세요."],
  devaluationSelf: ["나를 깎아내리는 말이 나오면 친구에게도 그렇게 말할지 물어요.", "오늘 해낸 작은 일 하나를 적어 보세요."],
  omnipotence: ["‘나는 괜찮아’가 떠오를 때 도움이 필요한 부분이 정말 없는지 살펴봐요.", "작은 부탁 하나를 해 보는 연습을 해 보세요."],
  denial: ["‘별일 아니야’가 떠오르면 ‘만약 별일이라면?’을 한 번만 생각해 봐요.", "믿을 만한 사람에게 내 상황을 어떻게 보는지 물어보세요."],
  projection: ["‘저 사람이 나를 싫어해’가 떠오를 때 ‘내가 나를 어떻게 느끼고 있지?’를 함께 물어요.", "상대의 마음은 짐작 대신 직접 물어서 확인해요."],
  rationalization: ["그럴듯한 이유가 떠오르면 ‘이유가 없다면 내 기분은?’을 물어요.", "아쉬움을 인정해도 괜찮아요. 그래야 다음을 바꿀 수 있어요."],
  fantasy: ["공상이 위로가 될 때는 충분히 쉬어도 돼요.", "다만 공상 속 바람 하나를 현실의 아주 작은 행동으로 옮겨 보세요."],
  splitting: ["‘전부 좋음/전부 나쁨’이 떠오를 때 ‘그 사이 어딘가’를 찾아 적어요.", "같은 사람에게서 좋은 면과 아쉬운 면을 하나씩 떠올려 보세요."],
  splittingOther: ["실망했을 때 그 사람과의 좋았던 기억 하나를 함께 떠올려요.", "관계를 정리하는 결정은 감정이 가라앉은 뒤로 미뤄요."],
  splittingSelf: ["나를 ‘완전히 실패’라고 느낄 때 ‘이번 일에서는’이라는 말을 붙여요.", "잘한 점과 아쉬운 점을 한 줄씩 적어 보세요."],
  projectiveIdentification: ["같은 갈등이 반복될 때, 그 순간 내 감정을 먼저 말로 표현해 봐요.", "‘지금 내가 불안해서 그래’처럼 감정의 주인을 분명히 해요."],
  actingOut: ["행동이 먼저 나가는 순간을 기록해 패턴을 찾아봐요. 언제, 누구와, 어떤 감정이었는지.", "그 순간에 대신할 행동 하나를 정해 두세요. 자리 뜨기, 찬물 마시기 같은 것이요."],
  passiveAggression: ["불편한 마음을 작게, 직접 말해 보세요. ‘이 부분은 나도 좀 힘들었어.’", "미루거나 실수로 드러나는 화가 있는지 돌아봐요."],
  helpRejectingComplaining: ["도움을 구할 때 ‘해결책’과 ‘들어 주기’ 중 무엇이 필요한지 먼저 말해요.", "받은 제안 중 하나만 작게 시도해 보세요."],
  withdrawal: ["물러나고 싶을 때 완전히 끊기보다 ‘조금 쉬고 연락할게’를 남겨요.", "돌아오는 시간을 정해 두면 회복이 더 쉬워요."],
  somatization: ["몸이 불편할 때 ‘요즘 마음에 부담되는 일이 있었나?’를 함께 살펴봐요.", "몸의 증상이 계속되면 먼저 의료진에게 확인받는 것도 중요해요."],
};

export const adviceNote = "검사 점수에 맞춰 고른 일반적인 자기돌봄 방법이에요. 치료나 진단을 대신하지 않고, 모든 방법이 모든 사람에게 맞지는 않아요. 해 보고 나에게 맞는 것을 남겨 두세요.";
