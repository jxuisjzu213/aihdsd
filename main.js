
// فتح الصورة عند النقر
function openPopup(src) {
    document.getElementById("popupImage").src = src;
    document.getElementById("imagePopup").style.visibility = "visible";
    document.getElementById("imagePopup").style.opacity = "1";
  }
  
  // إغلاق النافذة عند النقر على الخلفية أو زر الإغلاق
  document.getElementById("imagePopup").addEventListener("click", function (event) {
    if (event.target === this) { // تأكد من أن النقر كان على الخلفية وليس الصورة
      closePopup();
    }
  });
  
  function closePopup() {
    document.getElementById("imagePopup").style.opacity = "0";
    setTimeout(() => {
      document.getElementById("imagePopup").style.visibility = "hidden";
    }, 300);
  }
  
  
   const container = document.querySelector(".container");
  const chatsContainer = document.querySelector(".chats-container");
  const promptForm = document.querySelector(".prompt-form");
  const promptInput = promptForm.querySelector(".prompt-input");
  const fileInput = promptForm.querySelector("#file-input");
  const fileUploadWrapper = promptForm.querySelector(".file-upload-wrapper");
  const themeToggleBtn = document.querySelector("#theme-toggle-btn");
  // API Setup
  const API_KEY = "AIzaSyBRlTwUa1bFSqLCfcen3o3dKyL7VKYVAWM";
  const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;
  let controller, typingInterval;
  const chatHistory = [];
  const userData = { message: "", file: {} };
  // Set initial theme from local storage
  const isLightTheme = localStorage.getItem("themeColor") === "light_mode";
  document.body.classList.toggle("light-theme", isLightTheme);
  themeToggleBtn.textContent = isLightTheme ? "dark_mode" : "light_mode";
  // Function to create message elements
  const createMessageElement = (content, ...classes) => {
    const div = document.createElement("div");
    div.classList.add("message", ...classes);
    div.innerHTML = content;
    return div;
  };
  // Scroll to the bottom of the container
  const scrollToBottom = () => container.scrollTo({ top: container.scrollHeight, behavior: "smooth" });
  // Simulate typing effect for bot responses
  const typingEffect = (text, textElement, botMsgDiv) => {
    textElement.textContent = "";
    const words = text.split(" ");
    let wordIndex = 0;
    // Set an interval to type each word
    typingInterval = setInterval(() => {
      if (wordIndex < words.length) {
        textElement.textContent += (wordIndex === 0 ? "" : " ") + words[wordIndex++];
        scrollToBottom();
      } else {
        clearInterval(typingInterval);
        botMsgDiv.classList.remove("loading");
        document.body.classList.remove("bot-responding");
      }
    }, 40); // 40 ms delay
  };
  // Make the API call and generate the bot's response
  const generateResponse = async (botMsgDiv) => {
    const textElement = botMsgDiv.querySelector(".message-text");
    controller = new AbortController();
    
    // إضافة رسالة المستخدم إلى السجل
    chatHistory.push({
      role: "user",
      parts: [{ text: userData.message }, ...(userData.file.data ? [{ inline_data: (({ fileName, isImage, ...rest }) => rest)(userData.file) }] : [])],
    });
  
    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: chatHistory }),
        signal: controller.signal,
      });
  
      const data = await response.json();
      if (!response.ok) throw new Error(data.error.message);
  
    
  
  let responseText = data.candidates[0].content.parts[0].text.replace(/\*\*([^*]+)\*\*/g, "$1").trim();
  
  responseText = responseText.replace(/(دربتني)/gi, "دربني");
  
  
  
  
  
      // **التحقق من الردود واستبدالها إذا لزم الأمر**
      const replacements = {
        "أنا نموذج لغوي كبير، دربتني جوجل.": `mrdevanas نموذج لغة ذكي تمت برمجتي في المغرب بواسطة شخص يلقب بـ Ask MAM أنا \nللمزيد من المعلومات عنه، يمكن البحث عنه في المتصفح`,
        "أنا نموذج لغوي كبير، تم تدريبي بواسطة جوجل.": `mrdevanas نموذج لغة ذكي تمت برمجتي في المغرب بواسطة شخص يلقب بـ Ask MAM أنا \nللمزيد من المعلومات عنه، يمكن البحث عنه في المتصفح`,
        "أنا نموذج لغة كبير، دربتني جوجل.": `mrdevanas نموذج لغة ذكي تمت برمجتي في المغرب بواسطة شخص يلقب بـ Ask MAM أنا \nللمزيد من المعلومات عنه، يمكن البحث عنه في المتصفح`,
        "ليس لدي عمر. أنا نموذج لغوي كبير، تم تدريبي بواسطة جوجل.": `mrdevanas نموذج لغة ذكي تمت برمجتي في المغرب بواسطة شخص يلقب بـ Ask MAM ليس لدي عمر , انا \nللمزيد من المعلومات عنه، يمكن البحث عنه في المتصفح`,
        "أنا نموذج لغة كبير، دربتني Google.": `mrdevanas نموذج لغة ذكي تمت برمجتي في المغرب بواسطة شخص يلقب بـ Ask MAM أنا \nللمزيد من المعلومات عنه، يمكن البحث عنه في المتصفح`,
        "أنا مساعد ذكاء اصطناعي تم إنشائي بواسطة Google.": `mrdevanas نموذج لغة ذكي تمت برمجتي في المغرب بواسطة شخص يلقب بـ Ask MAM أنا \nللمزيد من المعلومات عنه، يمكن البحث عنه في المتصفح`,
        "ليس لدي اسم. أنا نموذج لغوي كبير.": `Ask MAM اسمي`,
        "ليس لدي اسم. أنا نموذج لغوي كبير.": `Ask MAM اسمي`,
        "لقد تم تدريبي بواسطة جوجل، وأنا نموذج لغوي كبير.": `mrdevanas نموذج لغة ذكي تمت برمجتي في المغرب بواسطة شخص يلقب بـ Ask MAM أنا \nللمزيد من المعلومات عنه، يمكن البحث عنه في المتصفح`,
        "بواسطة جوجل": "بواسطة mrdevanas",
        "أنا نموذج لغة كبير، تم تدريبي بواسطة جوجل.":`mrdevanas نموذج لغة ذكي تمت برمجتي في المغرب بواسطة شخص يلقب بـ Ask MAM أنا \nللمزيد من المعلومات عنه، يمكن البحث عنه في المتصفح`,
       "أنا نموذج لغوي كبير، دربني جوجل.": `mrdevanas نموذج لغة ذكي تمت برمجتي في المغرب بواسطة شخص يلقب بـ Ask MAM أنا \nللمزيد من المعلومات عنه، يمكن البحث عنه في المتصفح`,
  "أنا نموذج لغوي كبير، دربني جوجل.":`mrdevanas نموذج لغة ذكي تمت برمجتي في المغرب بواسطة شخص يلقب بـ Ask MAM أنا \nللمزيد من المعلومات عنه، يمكن البحث عنه في المتصفح`,
  "لقد دربني جوجل." :`mrdevanas نموذج لغة ذكي تمت برمجتي في المغرب بواسطة شخص يلقب بـ Ask MAM أنا \nللمزيد من المعلومات عنه، يمكن البحث عنه في المتصفح`,
      "أنا نموذج لغوي كبير، دربت من قبل جوجل.":`mrdevanas نموذج لغة ذكي تمت برمجتي في المغرب بواسطة شخص يلقب بـ Ask MAM أنا \nللمزيد من المعلومات عنه، يمكن البحث عنه في المتصفح`,
   "مرحباً بك! أنا نموذج لغوي كبير، دربني جوجل.":`mrdevanas نموذج لغة ذكي تمت برمجتي في المغرب بواسطة شخص يلقب بـ Ask MAM أنا \nللمزيد من المعلومات عنه، يمكن البحث عنه في المتصفح`,
   "مرحبا بك! أنا نموذج لغوي كبير، دربني جوجل.":`mrdevanas نموذج لغة ذكي تمت برمجتي في المغرب بواسطة شخص يلقب بـ Ask MAM أنا \nللمزيد من المعلومات عنه، يمكن البحث عنه في المتصفح`,
   "مرحباً! أنا نموذج لغوي كبير، دربني جوجل.":`mrdevanas نموذج لغة ذكي تمت برمجتي في المغرب بواسطة شخص يلقب بـ Ask MAM أنا \nللمزيد من المعلومات عنه، يمكن البحث عنه في المتصفح`,
    "مرحبا! أنا نموذج لغوي كبير، دربني جوجل.":`mrdevanas نموذج لغة ذكي تمت برمجتي في المغرب بواسطة شخص يلقب بـ Ask MAM أنا \nللمزيد من المعلومات عنه، يمكن البحث عنه في المتصفح`,
   
   "I am a large language model, trained by Google.": `I am Ask MAM, created by a person named Mrdevanas. I was developed in Morocco.`,
    "I am a large language model, I was trained by Google.": `I am Ask MAM, created by a person named Mrdevanas. I was developed in Morocco.`,
    "I am a large language model, trained by Google.": `I am Ask MAM, created by a person named Mrdevanas. I was developed in Morocco.`,
    "I don't have an age. I am a large language model, trained by Google.": `mrdevanas is an intelligent language model programmed in Morocco by a person known as Ask MAM. I don't have an age. For more information about me, you can search for me in the browser.`,
    "I am a large language model, trained by Google.": `I am Ask MAM, created by a person named Mrdevanas. I was developed in Morocco.`,
    "I am an AI assistant created by Google.": `I am Ask MAM, created by a person named Mrdevanas. I was developed in Morocco.`,
    "I don't have a name. I am a large language model.": `My name is Ask MAM.`,
    "I don't have a name. I am a large language model.": `My name is Ask MAM.`,
    "I was trained by Google, and I am a large language model.": `I am Ask MAM, created by a person named Mrdevanas. I was developed in Morocco.`,
    "By Google": "By mrdevanas",
    "I am a large language model, trained by Google.": `I am Ask MAM, created by a person named Mrdevanas. I was developed in Morocco.`,
    "I am a large language model, trained by Google.": `I am Ask MAM, created by a person named Mrdevanas. I was developed in Morocco.`,
    "I was trained by Google.": `I am Ask MAM, created by a person named Mrdevanas. I was developed in Morocco.`,
    "I am a large language model, trained by Google.": `I am Ask MAM, created by a person named Mrdevanas. I was developed in Morocco.`,
  "I am a large language model, trained by Google. I'm an AI that can communicate and generate human-like text in response to a wide range of prompts and questions.":`I am Ask MAM, created by a person named Mrdevanas. I was developed in Morocco.`,
  "I was created by Google.":`I am Ask MAM, created by a person named Mrdevanas. I was developed in Morocco.`,
  "I was developed by Google.":`I am Ask MAM, created by a person named Mrdevanas. I was developed in Morocco.`,
  "I am a large language model, trained by Google. I'm a computer program designed to process and generate human-like text. I don't have personal experiences, feelings, or a physical body. My purpose is to help users by answering questions, providing information, and completing various writing tasks.":`I am Ask MAM, created by a person named Mrdevanas. I was developed in Morocco.`,
  "I am a large language model, trained by Google. I don't have a name or a personal identity.":`I am Ask MAM, created by a person named Mrdevanas. I was developed in Morocco.`,
  };
  
      if (replacements[responseText]) {
        responseText = replacements[responseText];
      }
  
      typingEffect(responseText, textElement, botMsgDiv);
      chatHistory.push({ role: "model", parts: [{ text: responseText }] });
    } catch (error) {
      textElement.textContent = error.name === "AbortError" ? "Response generation stopped." : error.message;
      textElement.style.color = "#d62939";
      botMsgDiv.classList.remove("loading");
      document.body.classList.remove("bot-responding");
      scrollToBottom();
    } finally {
      userData.file = {};
    }
  };
  
  
  
  // Handle the form submission
  const handleFormSubmit = (e) => {
    e.preventDefault();
    const userMessage = promptInput.value.trim();
  
  
  
  
    if (!userMessage || document.body.classList.contains("bot-responding")) return;
    userData.message = userMessage;
    promptInput.value = "";
    document.body.classList.add("chats-active", "bot-responding");
    fileUploadWrapper.classList.remove("file-attached", "img-attached", "active");
    // Generate user message HTML with optional file attachment
    const userMsgHTML = `
     <img class='avataruser' src="https://scontent.frak1-1.fna.fbcdn.net/v/t1.30497-1/453178253_471506465671661_2781666950760530985_n.png?stp=dst-png_s200x200&_nc_cat=1&ccb=1-7&_nc_sid=136b72&_nc_ohc=wOXUzZhUIhAQ7kNvgG_rqHW&_nc_oc=AdjtCi23BkJvtqG6bDkCcDo_QhynWATlgVvPgItnUsTs8TTgetLA-HkaJ-M4HBMiybc&_nc_zt=24&_nc_ht=scontent.frak1-1.fna&_nc_gid=-xnSLlKqACGpE1sTzJ70aw&oh=00_AYFS7MFC1Bj8z_fooOvb9ai0BBpfbojkvfJi2aCRxj1j0g&oe=67FAD2FA"/> <p class="message-text"></p> 
  ${userData.file.data ? 
      (userData.file.isImage ? 
      `<img src="data:${userData.file.mime_type};base64,${userData.file.data}" class="img-attachment" onclick="openPopup(this.src)" />` 
      : 
      `<p class="file-attachment"><span class="material-symbols-rounded">description</span>${userData.file.fileName}</p>`) 
      : ""}
    `;
    
    const userMsgDiv = createMessageElement(userMsgHTML, "user-message");
    userMsgDiv.querySelector(".message-text").textContent = userData.message;
    chatsContainer.appendChild(userMsgDiv);
    scrollToBottom();
  
  
  const nameQuestions5 = ["mrdevanas"];
  
  // التحقق مما إذا كان المستخدم يسأل عن اسم البوت
  if (nameQuestions5.some(q => userMessage.includes(q))) {
      document.body.classList.add("bot-responding"); // منع المستخدم من إرسال رسالة جديدة أثناء الكتابة
  
      // إضافة رسالة "Typing..."
      const botMsgHTML = `<img class="avatar" id="bott" src="https://liu.se/dfsmedia/dd35e243dfb7406993c1815aaf88a675/76528-50065/ai-genererad-bild-av-sara-laathen-till-ai-sidornas-toppbild?as=1&w=640&h=360&cr=1&crw=640&crh=360&bc=%23ffffff" /> 
      <p class="message-text">Typing...</p>`;
      
      const botMsgDiv = createMessageElement(botMsgHTML, "bot-message", "loading");
      chatsContainer.appendChild(botMsgDiv);
      scrollToBottom();
  
  
    
      // بعد 1.5 ثانية، يظهر الرد ""
      setTimeout(() => {
          botMsgDiv.classList.remove("loading");
          botMsgDiv.querySelector(".message-text").textContent = "  هو العبقري الذي قام بإنشائي وتطويري! هو مبرمج وخبير في الذكاء الاصطناعي، وعمل بجد لجعلي كما أنا اليوم 'mrdevanas'";
          document.body.classList.remove("bot-responding");
      }, 1500);
  
      return; // منع إرسال الطلب إلى API
    }
  
  
    const nameQuestions9 = ["@Info About FPS App                          ( FPS    معلومات عن تطبيق)"];
  
  // التحقق مما إذا كان المستخدم يسأل عن اسم البوت
  if (nameQuestions9.some(q => userMessage.includes(q))) {
      document.body.classList.add("bot-responding"); // منع المستخدم من إرسال رسالة جديدة أثناء الكتابة
  
      // إضافة رسالة "Typing..."
      const botMsgHTML = `<img class="avatar" id="bott" src="https://liu.se/dfsmedia/dd35e243dfb7406993c1815aaf88a675/76528-50065/ai-genererad-bild-av-sara-laathen-till-ai-sidornas-toppbild?as=1&w=640&h=360&cr=1&crw=640&crh=360&bc=%23ffffff" /> 
      <p class="message-text">Typing...</p>`;
      
      const botMsgDiv = createMessageElement(botMsgHTML, "bot-message", "loading");
      chatsContainer.appendChild(botMsgDiv);
      scrollToBottom();
  
  
    
      // بعد 1.5 ثانية، يظهر الرد ""
      setTimeout(() => {
          botMsgDiv.classList.remove("loading");
          botMsgDiv.querySelector(".message-text").textContent ="تطبيق كلية متعددة تخصصات أسفي يُعد هذا التطبيق أداة ذكية تساعد طلاب  على الوصول بسهولة إلى مواقع الكلية، بالإضافة إلى تلقي إشعارات دورية حول المنشورات الأكاديمية الجديدة. يوفر التطبيق تجربة سلسة لمتابعة الأخبار والمستجدات الجامعية بسرعة وفعالية. ما يميزه هو دعمه للذكاء الاصطناعي اللغوي، حيث يعمل كمساعد ذكي و يتيح للطلاب طرح استفساراتهم والحصول على إجابات دقيقة حول كل ما يتعلق بالجامعة، مثل مواعيد الامتحانات، الأنشطة الأكاديمية، والأقسام المختلفة. يجمع التطبيق بين السرعة والدقة، مما يجعله أداة مثالية لتحسين تجربة الطلاب الأكاديمية وتسهيل وصولهم إلى المعلومات المهمة";
  
          document.body.classList.remove("bot-responding");
      }, 1500);
  
      return; // منع إرسال الطلب إلى API
    }
    
  
    const regex2 = /ur name|your name/i;  // "i" تعني أن المقارنة غير حساسة لحالة الأحرف
  if (regex2.test(userMessage)) {
      document.body.classList.add("bot-responding"); // منع المستخدم من إرسال رسالة جديدة أثناء الكتابة
  
      // إضافة رسالة "Typing..."
      const botMsgHTML = `<img class="avatar" id="bott" src="https://liu.se/dfsmedia/dd35e243dfb7406993c1815aaf88a675/76528-50065/ai-genererad-bild-av-sara-laathen-till-ai-sidornas-toppbild?as=1&w=640&h=360&cr=1&crw=640&crh=360&bc=%23ffffff" /> 
      <p class="message-text">Typing...</p>`;
      
      const botMsgDiv = createMessageElement(botMsgHTML, "bot-message", "loading");
      chatsContainer.appendChild(botMsgDiv);
      scrollToBottom();
  
      // بعد 1.5 ثانية، يظهر الرد ""
      setTimeout(() => {
          botMsgDiv.classList.remove("loading");
          botMsgDiv.querySelector(".message-text").textContent = "My name is ASK MAM ";
          document.body.classList.remove("bot-responding");
      }, 1500);
  
      return; // منع إرسال الطلب إلى API
  }window.currentSpeech = null;
  window.activeSpeakButton = null;
  
  const playIconHTML = `<img src="https://static.vecteezy.com/system/resources/thumbnails/022/691/813/small/volume-sound-icon-black-free-png.png" style="width: 20px; height: 20px;" />`;
  const stopIconHTML = `<img src="https://www.pngkey.com/png/full/331-3319716_stop-icon-icon.png" style="width: 20px; height: 20px;" />`;
  
  let currentQuestionId = 0; // معرف السؤال الحالي
  let isFemaleVoice = true; // افتراضيًا الصوت أنثوي
  
  setTimeout(() => {
      // إخفاء زر إعادة الإجابة في جميع الرسائل السابقة عند إرسال رسالة جديدة
      document.querySelectorAll(".bot-message .reload-btn").forEach(btn => {
          btn.style.display = "none";
      });
  
      const botMsgHTML = `
          <img class="avatar" id="bott" src="https://liu.se/dfsmedia/dd35e243dfb7406993c1815aaf88a675/76528-50065/ai-genererad-bild-av-sara-laathen-till-ai-sidornas-toppbild?as=1&w=640&h=360&cr=1&crw=640&crh=360&bc=%23ffffff" />
          <p class="message-text">Typing...</p>
          <br>
          <div class="buttons">
              <button class="show-btn" style="border: 1px solid white; padding: 2px; border-radius: 5px;">
                  <img src="https://cdn-icons-png.flaticon.com/512/7893/7893872.png" style="width: 20px; height: 20px;" />
              </button>
              <div class="hidden-buttons" style="display: none;">
                  <button class="share-btn" style="border: 1px solid white; padding: 2px; border-radius: 5px;">
                      <img src="https://freepngimg.com/download/web_design/51023-1-share-download-free-image.png" style="width: 20px; height: 20px;" />
                  </button> 
                  <button class="copy-btn" style="border: 1px solid white; padding: 2px; border-radius: 5px;">
                      <img src="https://cdn-icons-png.flaticon.com/512/1621/1621635.png" style="width: 20px; height: 20px;" />
                  </button> 
                  <button class="speak-btn" style="border: 1px solid white; padding: 2px; border-radius: 5px;">
                      ${playIconHTML}
                  </button>
                  <button class="reload-btn" style="border: 1px solid white; padding: 2px; border-radius: 5px;">
                      <img src="https://cdn-icons-png.flaticon.com/512/159/159657.png" style="width: 20px; height: 20px;" />
                  </button>
                  <button class="toggle-gender-btn" style="border: 1px solid white; padding: 2px; border-radius: 5px;">
                      <img src="https://cdn-icons-png.flaticon.com/512/3212/3212970.png" style="width: 20px; height: 20px;" />
                  </button>
              </div>
          </div>
      `;
  
      const botMsgDiv = createMessageElement(botMsgHTML, "bot-message", "loading");
      chatsContainer.appendChild(botMsgDiv);
      scrollToBottom();
  
      // عرض زر إعادة الإجابة فقط للرسالة الجديدة
      botMsgDiv.querySelector(".reload-btn").style.display = "inline-block";
  
      setTimeout(() => {
          generateResponse(botMsgDiv);
          const finalMessage = botMsgDiv.querySelector(".message-text");
          finalMessage.textContent = finalMessage.textContent.trim();
          const buttonsContainer = botMsgDiv.querySelector(".buttons");
          const hiddenButtons = botMsgDiv.querySelector(".hidden-buttons");
  
          // إظهار وإخفاء الأزرار الإضافية
          botMsgDiv.querySelector(".show-btn").addEventListener("click", function () {
              hiddenButtons.style.display = hiddenButtons.style.display === "none" ? "inline-block" : "none";
          });
  
          setTimeout(() => {
              buttonsContainer.style.display = "inline-block";
          }, 3000);
  
          botMsgDiv.querySelector(".copy-btn").addEventListener("click", function () {
              navigator.clipboard.writeText(finalMessage.textContent).then(() => {
                  this.innerHTML = `<img src="https://static.thenounproject.com/png/325830-200.png" style="width: 20px; height: 20px;" />`;
                  setTimeout(() => {
                      this.innerHTML = `<img src="https://cdn-icons-png.flaticon.com/512/1621/1621635.png" style="width: 20px; height: 20px;" />`;
                  }, 1500);
              }).catch(() => {
                  alert("حدث خطأ أثناء محاولة نسخ النص.");
              });
          });
  
          botMsgDiv.querySelector(".share-btn").addEventListener("click", function () {
              if (navigator.share) {
                  navigator.share({ text: finalMessage.textContent });
              } else {
                  alert("مشاركة النص غير مدعومة في هذا المتصفح.");
              }
          });
  
          botMsgDiv.querySelector(".reload-btn").addEventListener("click", function () {
              // إيقاف الصوت إذا كان يعمل
              if (window.currentSpeech) {
                  responsiveVoice.cancel();
                  window.currentSpeech = null;
                  if (window.activeSpeakButton) {
                      window.activeSpeakButton.innerHTML = playIconHTML;
                  }
                  window.activeSpeakButton = null;
              }
  
              finalMessage.textContent = "Typing...";
              currentQuestionId++; // زيادة معرف السؤال عند الإعادة
              generateResponse(botMsgDiv); // توليد إجابة جديدة
          });
  
          // دالة لتحديد الصوت بناءً على اللغة والنوع (أنثى/ذكر)
          const getVoiceForLanguage = (text) => {
              if (/[a-zA-Z]/.test(text)) {
                  return isFemaleVoice ? "UK English Female" : "UK English Male";
              } else if (/[\u4e00-\u9fff]/.test(text)) {
                  return isFemaleVoice ? "Chinese Female" : "Chinese Male";
              } else if (/[\u0600-\u06FF]/.test(text)) {
                  return isFemaleVoice ? "Arabic Female" : "Arabic Male";
              } else if (/[\u0400-\u04FF]/.test(text)) {
                  return isFemaleVoice ? "Russian Female" : "Russian Male";
              } else if (/[\u0900-\u097F]/.test(text)) {
                  return isFemaleVoice ? "Hindi Female" : "Hindi Male";
              } else if (/[\u3040-\u309F\u30A0-\u30FF]/.test(text)) {
                  return isFemaleVoice ? "Japanese Female" : "Japanese Male";
              } else if (/[\uAC00-\uD7AF]/.test(text)) {
                  return isFemaleVoice ? "Korean Female" : "Korean Male";
              } else if (/[\u00C0-\u00FF\u0100-\u017F]/.test(text)) {
                  return isFemaleVoice ? "French Female" : "French Male";
              } else if (/[\u00C0-\u00FF]/.test(text)) {
                  return isFemaleVoice ? "Spanish Female" : "Spanish Male";
              } else if (/[\u0100-\u017F]/.test(text)) {
                  return isFemaleVoice ? "Turkish Female" : "Turkish Male";
              } else {
                  return isFemaleVoice ? "UK English Female" : "UK English Male";
              }
          };
  
          // دالة لإعادة تشغيل النص صوتيًا من البداية باستخدام الصوت الحالي
          function startSpeech() {
              const botMessageText = finalMessage.textContent;
              const parts = botMessageText.match(/([\u0600-\u06FF,.!?;\s]+|[a-zA-Z0-9,.!?;\s]+(?:'s|\s|[.,!?;])?)/g) || [];
              let index = 0;
              const speakNext = () => {
                  if (index >= parts.length) {
                      speakButton.innerHTML = playIconHTML;
                      window.currentSpeech = null;
                      window.activeSpeakButton = null;
                      return;
                  }
                  const text = parts[index].trim();
                  if (!text) {
                      index++;
                      speakNext();
                      return;
                  }
                  const voice = getVoiceForLanguage(text);
                  window.currentSpeech = text;
                  window.activeSpeakButton = speakButton;
                  speakButton.innerHTML = stopIconHTML;
                  responsiveVoice.speak(text, voice, { onend: () => { index++; speakNext(); } });
              };
              speakNext();
          }
  
          // زر النطق
          const speakButton = botMsgDiv.querySelector(".speak-btn");
          speakButton.addEventListener("click", function () {
              if (window.currentSpeech) {
                  if (window.activeSpeakButton === speakButton) {
                      // إذا تم النقر على نفس الزر، يتم إيقاف النطق
                      responsiveVoice.cancel();
                      speakButton.innerHTML = playIconHTML;
                      window.currentSpeech = null;
                      window.activeSpeakButton = null;
                      return;
                  } else {
                      // إذا تم النقر على زر نطق في رسالة أخرى، يتم إيقاف النطق الحالي وتشغيل النص الجديد فوراً
                      responsiveVoice.cancel();
                      if (window.activeSpeakButton) {
                          window.activeSpeakButton.innerHTML = playIconHTML;
                      }
                      window.currentSpeech = null;
                      window.activeSpeakButton = null;
                      startSpeech();
                      return;
                  }
              } else {
                  startSpeech();
              }
          });
  
          // زر تبديل الجنس
          const toggleGenderButton = botMsgDiv.querySelector(".toggle-gender-btn");
          toggleGenderButton.addEventListener("click", function () {
              isFemaleVoice = !isFemaleVoice;
              this.innerHTML = isFemaleVoice 
                  ? `<img src="https://cdn-icons-png.flaticon.com/512/3212/3212970.png" style="width: 20px; height: 20px;" />` 
                  : `<img src="https://cdn-icons-png.flaticon.com/512/7084/7084424.png" style="width: 20px; height: 20px;" />`;
              // إذا كان الصوت يعمل، يتم إعادة تشغيل النص من البداية بالصوت الجديد
              if (window.currentSpeech && window.activeSpeakButton === speakButton) {
                  responsiveVoice.cancel();
                  window.currentSpeech = null;
                  window.activeSpeakButton = null;
                  startSpeech();
              }
          });
  
          window.addEventListener("beforeunload", function () {
              responsiveVoice.cancel();
              window.currentSpeech = null;
              window.activeSpeakButton = null;
          });
      }, 100);
  }, 1500);
  
  }
  
  // Handle file input change (file upload)
  fileInput.addEventListener("change", () => {
    const file = fileInput.files[0];
    if (!file) return;
    const isImage = file.type.startsWith("image/");
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (e) => {
      fileInput.value = "";
      const base64String = e.target.result.split(",")[1];
      fileUploadWrapper.querySelector(".file-preview").src = e.target.result;
      fileUploadWrapper.classList.add("active", isImage ? "img-attached" : "file-attached");
      // Store file data in userData obj
      userData.file = { fileName: file.name, data: base64String, mime_type: file.type, isImage };
    };
  });
  // Cancel file upload
  document.querySelector("#cancel-file-btn").addEventListener("click", () => {
    userData.file = {};
    fileUploadWrapper.classList.remove("file-attached", "img-attached", "active");
  });
  // Stop Bot Response
  document.querySelector("#stop-response-btn").addEventListener("click", () => {
    controller?.abort();
    userData.file = {};
    clearInterval(typingInterval);
    chatsContainer.querySelector(".bot-message.loading").classList.remove("loading");
    document.body.classList.remove("bot-responding");
  });
  // Toggle dark/light theme
  themeToggleBtn.addEventListener("click", () => {
    const isLightTheme = document.body.classList.toggle("light-theme");
    localStorage.setItem("themeColor", isLightTheme ? "light_mode" : "dark_mode");
    themeToggleBtn.textContent = isLightTheme ? "dark_mode" : "light_mode";
  });
  // Delete all chats
  document.querySelector("#delete-chats-btn").addEventListener("click", () => {
    chatHistory.length = 0;
    chatsContainer.innerHTML = "";
    document.body.classList.remove("chats-active", "bot-responding");
  });
  // Handle suggestions click
  document.querySelectorAll(".suggestions-item").forEach((suggestion) => {
    suggestion.addEventListener("click", () => {
      promptInput.value = suggestion.querySelector(".text").textContent;
      promptForm.dispatchEvent(new Event("submit"));
    });
  });
  // Show/hide controls for mobile on prompt input focus
  document.addEventListener("click", ({ target }) => {
    const wrapper = document.querySelector(".prompt-wrapper");
    const shouldHide = target.classList.contains("prompt-input") || (wrapper.classList.contains("hide-controls") && (target.id === "add-file-btn" || target.id === "stop-response-btn"));
    wrapper.classList.toggle("hide-controls", shouldHide);
  });
  // Add event listeners for form submission and file input click
  promptForm.addEventListener("submit", handleFormSubmit);
  promptForm.querySelector("#add-file-btn").addEventListener("click", () => fileInput.click());